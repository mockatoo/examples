<p align="center">
  <img src="../mockatoo-logo.png" alt="Mockatoo" width="128" height="128">
</p>

<h1 align="center">Mockatoo</h1>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../readme-headline-dark.svg">
    <img src="../readme-headline-light.svg" alt="Test Google, Microsoft, GitHub, Apple, Discord, LinkedIn, X and Facebook sign-in in CI, without getting blocked. One free OAuth provider for agentic development, E2E tests, and CI. No app registration, no bot checks, no fragile workarounds." width="880">
  </picture>
</p>

<p align="center">
  <a href="https://github.com/mockatoo/examples/actions/workflows/socialite-laravel.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/socialite-laravel.yml/badge.svg" alt="Laravel + Socialite"></a>
</p>

<p align="center">
  <a href="https://mockatoo.globalunderdog.com">Website</a> ·
  <a href="https://mockatoo.globalunderdog.com/docs">Documentation</a> ·
  <a href="https://github.com/mockatoo/connectors">Connectors</a> ·
  <a href="https://app.mockatoo.globalunderdog.com">Create a free test account</a>
</p>

# Laravel + Socialite

Sign in with Apple, Google, GitHub, Discord, Facebook, LinkedIn, Microsoft, or X. Laravel stores the provider, account ID, and available email in an encrypted cookie session. Provider tokens are discarded after sign-in.

## Run locally

Use PHP 8.3+, Composer 2, Node.js 24, and pnpm 10. From this directory:

```sh
pnpm install
pnpm build
printf 'APP_KEY=base64:%s\n' "$(openssl rand -base64 32)" > .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Use your [Mockatoo test account](https://app.mockatoo.globalunderdog.com) to sign in. To run the browser tests, add `MOCKATOO_TEST_EMAIL` and `MOCKATOO_TEST_PASSWORD` to your ignored `.env.local`, then run `pnpm exec playwright install chromium` and `pnpm test`.

## How the switch works

`config/services.php` reads the switch and provider credentials. `app/Socialite/Providers.php` registers the drivers. The committed `.env` sets `MOCKATOO_FORCE=true`. In that mode the drivers use Mockatoo's shared OAuth client and construct the callback from the incoming request. `MOCKATOO_URL` optionally overrides the mock origin. To try your own OAuth client locally, set `MOCKATOO_FORCE=false` in `.env.local` and configure the provider below.

Socialite's built-in drivers for Google, GitHub, Facebook, LinkedIn OpenID Connect, and X retain their scopes, token exchange, and profile mapping. In mock mode the adapter replaces the authorization URL and maps the token and profile requests to Mockatoo. Socialite has no Apple, Discord, or Microsoft driver, so those use the generic [OpenID Connect driver](https://github.com/SocialiteProviders/OpenIDConnect) from Socialite Providers. It reads each provider's endpoints and signing keys from its issuer's discovery document and verifies the ID token's signature, issuer, audience, expiry, and nonce. In mock mode the issuer is Mockatoo's. The driver caches discovery documents through Laravel's cache, which this demo keeps in memory; `config/cache.php` sets the store.

## Deploy the demo

Set the Vercel project root to `socialite-laravel` and use the included `vercel.json` with the community PHP runtime. Set `APP_KEY` for Production and Preview to `base64:` followed by the output of `openssl rand -base64 32`. The demo uses the committed mock opt-in and needs no provider credentials or database.

## Before production

Remove `MOCKATOO_FORCE=true` from `.env` and unset it in the deployment environment. For each provider you want to offer, create a real OAuth client and set the variables below. Unconfigured providers are hidden. Replace `https://your-app.example` with your HTTPS app origin and register the resulting URL with the provider.

| Provider | Environment variables | Callback path |
| --- | --- | --- |
| Apple | `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET`, `APPLE_REDIRECT_URI` | `/auth/apple/callback` |
| Google | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | `/auth/google/callback` |
| GitHub | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_REDIRECT_URI` | `/auth/github/callback` |
| Discord | `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_REDIRECT_URI` | `/auth/discord/callback` |
| Facebook | `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`, `FACEBOOK_REDIRECT_URI` | `/auth/facebook/callback` |
| LinkedIn | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_REDIRECT_URI` | `/auth/linkedin/callback` |
| Microsoft | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_REDIRECT_URI`, `MICROSOFT_TENANT_ID` (defaults to `common`) | `/auth/microsoft/callback` |
| X | `X_CLIENT_ID`, `X_CLIENT_SECRET`, `X_REDIRECT_URI` | `/auth/x/callback` |

For example, set `GOOGLE_REDIRECT_URI=https://your-app.example/auth/google/callback`. Apple needs a Services ID and a signed, expiring client-secret JWT. LinkedIn needs the Sign In with LinkedIn using OpenID Connect product. X needs an OAuth 2.0 confidential client with permission to read user email. Serve the app over HTTPS so the secure session cookie can accompany Apple's cross-site callback.
