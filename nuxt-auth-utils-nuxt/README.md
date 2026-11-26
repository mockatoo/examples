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
  <a href="https://github.com/mockatoo/examples/actions/workflows/nuxt-auth-utils-nuxt.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/nuxt-auth-utils-nuxt.yml/badge.svg" alt="nuxt-auth-utils + Nuxt"></a>
</p>

<p align="center">
  <a href="https://mockatoo.globalunderdog.com">Website</a> ·
  <a href="https://mockatoo.globalunderdog.com/docs">Documentation</a> ·
  <a href="https://github.com/mockatoo/connectors">Connectors</a> ·
  <a href="https://app.mockatoo.globalunderdog.com">Create a free test account</a>
</p>

# nuxt-auth-utils + Nuxt 4

A sign-in example using [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils) and Mockatoo's simulated Google, GitHub, Facebook, Microsoft, and X providers. OAuth state and the session are stored in sealed cookies; there is no database. The mock's endpoints live in `lib/oauth.ts`, and each provider has a route in `server/routes/auth/`.

Try the [live example](https://mockatoo-nuxt-auth-utils-nuxt.vercel.app). The [Nuxt guide](https://mockatoo.globalunderdog.com/docs/nuxt) walks through the setup.

nuxt-auth-utils has no Mockatoo connector, and doesn't need one: each provider handler reads its endpoints from `runtimeConfig.oauth`. Its Apple, Discord, and LinkedIn handlers fetch fixed provider URLs, so this example leaves them out.

## Run locally

Use Node.js 24 and pnpm 10. Create a test account at [Mockatoo](https://app.mockatoo.globalunderdog.com), then create `.env.local` with `NUXT_APP_SECRET`, `MOCKATOO_TEST_EMAIL`, and `MOCKATOO_TEST_PASSWORD`. Generate the secret with `openssl rand -base64 32`. The email and password are only used by the Playwright tests.

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. Run `pnpm test` to exercise sign-in, sign-out, and denied consent (install Chromium first with `pnpm exec playwright install chromium`).

`nuxt.config.ts` reads the Mockatoo switch at build time and puts the mock's endpoints in `runtimeConfig.oauth`. The committed `.env` turns the mock on in production builds too; `pnpm dev` uses it either way. `NUXT_APP_SECRET` is read only at runtime. Nuxt generates one in development, but production builds need it set. The dev command loads local secrets from `.env.local` before Nuxt loads the non-secret `.env` config.

`server/middleware/oauth-error.ts` sends a declined consent back to the page with `?error=`. The library's Google, Microsoft, and X handlers ignore the callback's `error` parameter and would start sign-in again.

## Deploy

Deploy this directory to Vercel and set a generated `NUXT_APP_SECRET` in both Production and Preview environments. The committed `.env` keeps the demo on the mock; no deployment URL or provider credentials are needed.

## Before production

Delete `MOCKATOO_FORCE` from `.env`. Production then uses the real providers and `pnpm dev` keeps the mock. The bundled Playwright test runs a production build, so run it with `MOCKATOO_FORCE=true pnpm test` after that. Register an OAuth application with each provider and configure its callback as `https://<your-domain>/auth/<provider>` (for example, `/auth/github`). Set `NUXT_OAUTH_<PROVIDER>_CLIENT_ID` and `NUXT_OAUTH_<PROVIDER>_CLIENT_SECRET` in the deployment environment (for example, `NUXT_OAUTH_GOOGLE_CLIENT_ID` and `NUXT_OAUTH_GOOGLE_CLIENT_SECRET`). Microsoft also needs `NUXT_OAUTH_MICROSOFT_TENANT`. Configure only providers for which you have credentials, and remove unused providers and buttons.

The app requests basic profile and email access where available. X's OAuth 2.0 user API does not provide an email address, so that option requests `users.read` and the `tweet.read` permission required for its user lookup, and identifies the user by name. Microsoft reads the user from Graph's OpenID Connect userinfo endpoint. Mockatoo is for development and testing, not production authentication.
