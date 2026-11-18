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
  <a href="https://github.com/mockatoo/examples/actions/workflows/allauth-django.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/allauth-django.yml/badge.svg" alt="Django + allauth"></a>
</p>

<p align="center">
  <a href="https://mockatoo.globalunderdog.com">Website</a> ·
  <a href="https://mockatoo.globalunderdog.com/docs">Documentation</a> ·
  <a href="https://github.com/mockatoo/connectors">Connectors</a> ·
  <a href="https://app.mockatoo.globalunderdog.com">Create a free test account</a>
</p>

# Django + allauth

Sign in with Apple, Google, GitHub, Discord, Facebook, LinkedIn, Microsoft, or X. The Mockatoo switch in `example/settings.py` selects the provider subclasses and client credentials in `example/providers.py`. The subclasses point allauth at Mockatoo. LinkedIn and Microsoft use an OpenID Connect subclass that selects each provider’s discovery document. Microsoft gets the signed-in identity from the Entra ID token because allauth’s dedicated provider requires the Graph `/v1.0/me` endpoint. The mock X subclass reads `confirmed_email` from its profile. Real X sign-in uses allauth’s built-in provider, and the session shows the X username when email is unavailable. Allauth handles OAuth state, callbacks, Django sign-in, and sign-out.

## Run locally

Use Python 3.12, uv, Node.js 24, and pnpm 10. Create `.env.local` with `DJANGO_SECRET_KEY` set to the output of `openssl rand -base64 48`.

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. The committed `.env` enables Mockatoo. Django stores allauth’s users and linked accounts in `db.sqlite3`. A multi-instance deployment needs a shared database so every instance can resolve the signed-in user. For browser tests, add `MOCKATOO_TEST_EMAIL` and `MOCKATOO_TEST_PASSWORD` from your [Mockatoo account](https://app.mockatoo.globalunderdog.com) to `.env.local`, then run `pnpm exec playwright install chromium` and `pnpm test`.

## Use real providers

Remove `MOCKATOO_FORCE=true` from `.env` and supply the credentials for the providers you want to enable. Start with a fresh database so the app starts with real provider identities. Register each callback below with your app’s origin.

| Provider | Environment variables | Callback path |
| --- | --- | --- |
| Apple | `APPLE_CLIENT_ID` (Services ID), `APPLE_CLIENT_SECRET` (Key ID), `APPLE_TEAM_ID`, `APPLE_PRIVATE_KEY` (PEM) | `/accounts/apple/login/callback/` |
| Google | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | `/accounts/google/login/callback/` |
| GitHub | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | `/accounts/github/login/callback/` |
| Discord | `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | `/accounts/discord/login/callback/` |
| Facebook | `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET` | `/accounts/facebook/login/callback/` |
| LinkedIn | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` | `/accounts/oidc/linkedin/login/callback/` |
| Microsoft | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID` (tenant GUID) | `/accounts/oidc/microsoft/login/callback/` |
| X | `X_CLIENT_ID`, `X_CLIENT_SECRET` | `/accounts/twitter_oauth2/login/callback/` |

Enable Sign In with LinkedIn using OpenID Connect. Use a confidential OAuth 2.0 web app for X. Apple requires an HTTPS return URL. On an HTTPS host, set `DJANGO_SECURE_COOKIES=true` and configure Django’s HTTPS proxy settings as needed.

In mock mode, allauth can sign in an existing demo user by their verified Mockatoo email so the same test account works across the provider buttons. This setting relies on Mockatoo authenticating the email owner and is off for real providers.
