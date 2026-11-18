<?php

namespace App\Socialite;

use Illuminate\Support\ServiceProvider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\SocialiteManager;
use Laravel\Socialite\Two\AbstractProvider;
use Laravel\Socialite\Two\FacebookProvider;
use Laravel\Socialite\Two\GithubProvider;
use Laravel\Socialite\Two\LinkedInOpenIdProvider;
use Laravel\Socialite\Two\XProvider;
use SocialiteProviders\Manager\Config;
use SocialiteProviders\OpenIDConnect\Provider as OpenIDConnectProvider;
use SocialiteProviders\OpenIDConnect\Providers\EntraProvider;

final class Providers extends ServiceProvider
{
    public const LABELS = [
        'apple' => 'Apple',
        'google' => 'Google',
        'github' => 'GitHub',
        'discord' => 'Discord',
        'facebook' => 'Facebook',
        'linkedin' => 'LinkedIn',
        'microsoft' => 'Microsoft',
        'x' => 'X',
    ];

    public static function available(): array
    {
        return array_filter(self::LABELS, fn ($id) => config('services.mockatoo.enabled')
            || (config("services.$id.client_id") && config("services.$id.client_secret")
                && config("services.$id.redirect")), ARRAY_FILTER_USE_KEY);
    }

    public function boot(): void
    {
        if (! config('app.key')) {
            throw new \RuntimeException('Set APP_KEY to a generated Laravel application key.');
        }

        // Leave the built-in drivers in charge in real-provider mode.
        $drivers = config('services.mockatoo.enabled') ? array_keys(self::LABELS) : [
            'apple', 'discord', 'microsoft', 'linkedin',
        ];

        foreach ($drivers as $id) {
            Socialite::extend($id, fn () => $this->createDriver($id));
        }
    }

    private function createDriver(string $id): AbstractProvider
    {
        /** @var SocialiteManager $socialite */
        $socialite = Socialite::getFacadeRoot();
        $config = config("services.$id");
        $mock = config('services.mockatoo.enabled');
        $origin = config('services.mockatoo.origin');

        if ($mock) {
            $config['client_id'] = 'mockatoo';
            $config['client_secret'] = 'mockatoo-secret';
            $config['redirect'] = url("/auth/$id/callback");
        }
        $config['guzzle'] = ['timeout' => 10, 'allow_redirects' => false];

        if (in_array($id, ['apple', 'discord', 'microsoft'], true)) {
            return $this->openIdDriver($id, $mock ? $origin : null, $config, $socialite);
        }

        if (! $mock) {
            return $socialite->buildProvider(LinkedInOpenIdProvider::class, $config);
        }

        return $this->mockDriver($id, $origin, $config, $socialite);
    }

    /**
     * Socialite has no Apple, Discord or Microsoft driver. All three publish
     * OpenID Connect discovery, so a generic driver reads their endpoints and
     * signing keys from the issuer and verifies the ID token.
     */
    private function openIdDriver(string $id, ?string $mock, array $config, SocialiteManager $socialite): AbstractProvider
    {
        $tenant = $mock ? '00000000-0000-4000-8000-000000000001' : rawurlencode($config['tenant']);
        [$class, $issuer, $scopes] = match ($id) {
            // Apple rejects the default profile scope.
            'apple' => [OpenIDConnectProvider::class, $mock ? "$mock/apple" : 'https://appleid.apple.com', ['openid', 'email']],
            // Discord's ID token has no email, so the driver reads it from userinfo.
            'discord' => [OpenIDConnectProvider::class, $mock ? "$mock/discord" : 'https://discord.com', ['openid', 'identify', 'email']],
            // Entra checks multi-tenant issuers and reads the email from preferred_username.
            'microsoft' => [
                EntraProvider::class,
                ($mock ? "$mock/login.microsoftonline.com" : 'https://login.microsoftonline.com')."/$tenant/v2.0",
                ['openid', 'profile', 'email'],
            ],
        };

        $driver = $socialite->buildProvider($class, $config);
        $driver->setConfig(new Config($config['client_id'], $config['client_secret'], $config['redirect'], [
            'base_url' => $issuer,
            'scopes' => $scopes,
            'tenant' => $tenant,
        ]));

        // Apple returns the code in a cross-site POST when it shares the email.
        return $id === 'apple' ? $driver->with(['response_mode' => 'form_post']) : $driver;
    }

    private function mockDriver(string $id, string $origin, array $config, SocialiteManager $socialite): AbstractProvider
    {
        $args = [request(), $config['client_id'], $config['client_secret'], $config['redirect']];
        [$driver, $authorize, $endpoints] = match ($id) {
            'google' => [
                $socialite->buildProvider(MockatooGoogleProvider::class, $config),
                '/google/o/oauth2/v2/auth',
                [
                    'https://www.googleapis.com/oauth2/v4/token' => '/google/token',
                    'https://www.googleapis.com/oauth2/v3/userinfo' => '/google/v1/userinfo',
                ],
            ],
            'github' => [
                new class (...$args) extends GithubProvider { use UsesMockatoo; },
                '/github/login/oauth/authorize',
                [
                    'https://github.com/login/oauth/access_token' => '/github/login/oauth/access_token',
                    'https://api.github.com/user' => '/github/api/v3/user',
                    'https://api.github.com/user/emails' => '/github/api/v3/user/emails',
                ],
            ],
            'facebook' => [
                (new class (...$args) extends FacebookProvider { use UsesMockatoo; })
                    ->usingGraphVersion('v24.0')->fields(['name', 'email']),
                '/facebook/v24.0/dialog/oauth',
                [
                    'https://graph.facebook.com/v24.0/oauth/access_token' => '/facebook/graph/v24.0/oauth/access_token',
                    'https://graph.facebook.com/v24.0/me' => '/facebook/graph/v24.0/me',
                ],
            ],
            'linkedin' => [
                new class (...$args) extends LinkedInOpenIdProvider { use UsesMockatoo; },
                '/linkedin/oauth/v2/authorization',
                [
                    'https://www.linkedin.com/oauth/v2/accessToken' => '/linkedin/oauth/v2/accessToken',
                    'https://api.linkedin.com/v2/userinfo' => '/linkedin/v2/userinfo',
                ],
            ],
            'x' => [
                new class (...$args) extends XProvider { use UsesMockatoo; },
                '/x/i/oauth2/authorize',
                [
                    'https://api.x.com/2/oauth2/token' => '/x/2/oauth2/token',
                    'https://api.x.com/2/users/me' => '/x/2/users/me',
                ],
            ],
        };

        $driver->useMockatoo($origin, $authorize, $endpoints);

        return $driver;
    }
}
