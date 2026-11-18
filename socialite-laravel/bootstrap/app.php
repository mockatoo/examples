<?php

use App\Socialite\Providers;
use Dotenv\Dotenv;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Middleware;
use Symfony\Component\HttpFoundation\Request;

$base = dirname(__DIR__);
Dotenv::createUnsafeImmutable($base, '.env.local')->safeLoad();
Dotenv::createUnsafeImmutable($base)->safeLoad();

$app = Application::configure(basePath: $base)
    ->withProviders([Providers::class])
    ->withRouting(web: $base.'/routes/web.php')
    ->withMiddleware(function (Middleware $middleware) {
        // Apple posts from another origin. Socialite still validates OAuth state.
        $middleware->validateCsrfTokens(except: ['auth/apple/callback']);
        if (env('VERCEL')) {
            $middleware->trustProxies(at: '*', headers: Request::HEADER_X_FORWARDED_PROTO);
        }
    })
    ->withExceptions()
    ->create();

if (env('VERCEL')) {
    $app->useStoragePath(sys_get_temp_dir().'/socialite-laravel');
    $app->useBootstrapPath($app->storagePath());
}
foreach ([$app->bootstrapPath('cache'), $app->storagePath('framework/views')] as $directory) {
    if (! is_dir($directory)) {
        mkdir($directory, 0775, recursive: true);
    }
}

return $app;
