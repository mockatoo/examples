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
  <a href="https://github.com/mockatoo/examples/actions/workflows/authlib-flask.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/authlib-flask.yml/badge.svg" alt="Authlib + Flask"></a>
</p>

<p align="center">
  <a href="https://mockatoo.globalunderdog.com">Website</a> ·
  <a href="https://mockatoo.globalunderdog.com/docs">Documentation</a> ·
  <a href="https://github.com/mockatoo/connectors">Connectors</a> ·
  <a href="https://app.mockatoo.globalunderdog.com">Create a free test account</a>
</p>

# Flask + Authlib

Sign in with Apple, Google, GitHub, Discord, Facebook, LinkedIn, Microsoft, or X. `providers.py` registers standard Authlib clients with real or Mockatoo endpoints. The routes in `app.py` use the same Authlib redirect and code exchange in either mode. Flask keeps the provider, account ID, and available email in a signed session cookie. Provider tokens are discarded after sign-in.

Try the [live example](https://mockatoo-authlib-flask.vercel.app).

## Run locally

Use Python 3.12, uv, Node.js 24, and pnpm 10. Create `.env.local` with `FLASK_SECRET_KEY` set to the output of `openssl rand -base64 32`.

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. The committed `.env` configures the demo to use Mockatoo. For browser tests, add `MOCKATOO_TEST_EMAIL` and `MOCKATOO_TEST_PASSWORD` from your [Mockatoo account](https://app.mockatoo.globalunderdog.com) to `.env.local`. Run `pnpm exec playwright install chromium` and `pnpm test`.

## Deploy to Vercel

Deploy this directory as a Flask project. Set `FLASK_SECRET_KEY` in Production and Preview. Run `vercel --prod` from this directory after linking the project. Callback URLs use the current request’s origin, so localhost and Vercel preview deployments each use their own callback.

## Use real providers in your app

Delete `MOCKATOO_FORCE=true` from `.env` before shipping. Set the variables for each provider you want to enable. Register `https://<your-domain>/auth/<provider>/callback` as the redirect URI, with the provider ID from the table.

| Provider ID | Environment variables | Provider setup |
| --- | --- | --- |
| `apple` | `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET` | Use a Services ID and an HTTPS return URL. The secret is an Apple developer-signed client-secret JWT. Rotate it before expiry. The callback receives a form POST. |
| `google` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Create a Google OAuth web client. |
| `github` | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Create a GitHub OAuth App. The app can read the primary verified email when the public profile omits it. |
| `discord` | `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | Create a Discord OAuth2 application and add its redirect URI. |
| `facebook` | `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET` | Set up Facebook Login with the valid OAuth redirect URI and email permission. |
| `linkedin` | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` | Enable Sign In with LinkedIn using OpenID Connect. |
| `microsoft` | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID` | Register an Entra web application. Use your tenant’s GUID so discovery and ID-token issuer validation use the same tenant. |
| `x` | `X_CLIENT_ID`, `X_CLIENT_SECRET` | Register a confidential OAuth 2.0 web app. This flow uses S256 PKCE. The app requests verified email access through the `users.email` scope. |

Use HTTPS in production. Vercel enables secure session cookies automatically. On another HTTPS host, set `FLASK_SECURE_COOKIES=true` and configure your proxy so Flask sees the public HTTPS origin. Apple’s cross-site POST uses a secure cookie and works on HTTPS or Chromium’s trusted localhost.

## Point an existing integration at Mockatoo

For manual configuration in development or CI, turn off `MOCKATOO_FORCE` and use `mockatoo` and `mockatoo-secret` as the provider client ID and secret. Keep the same routes and scopes.

For Apple, Google, LinkedIn, and Microsoft, set `<PROVIDER>_SERVER_METADATA_URL` to the discovery document. For example, use `GOOGLE_SERVER_METADATA_URL=https://app.mockatoo.globalunderdog.com/google/.well-known/openid-configuration`. The other discovery paths are `/apple/.well-known/openid-configuration`, `/linkedin/oauth/.well-known/openid-configuration`, and `/login.microsoftonline.com/00000000-0000-4000-8000-000000000001/v2.0/.well-known/openid-configuration`.

For GitHub, Discord, Facebook, and X, set `<PROVIDER>_AUTHORIZE_URL`, `<PROVIDER>_ACCESS_TOKEN_URL`, and `<PROVIDER>_API_BASE_URL`. Append these paths to `https://app.mockatoo.globalunderdog.com`.

| Provider | Authorize path | Token path | API base path |
| --- | --- | --- | --- |
| GitHub | `/github/login/oauth/authorize` | `/github/login/oauth/access_token` | `/github/api/v3/` |
| Discord | `/discord/api/oauth2/authorize` | `/discord/api/oauth2/token` | `/discord/api/` |
| Facebook | `/facebook/v24.0/dialog/oauth` | `/facebook/graph/v24.0/oauth/access_token` | `/facebook/graph/v24.0/` |
| X | `/x/i/oauth2/authorize` | `/x/2/oauth2/token` | `/x/2/` |
