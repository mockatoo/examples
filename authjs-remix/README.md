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
  <a href="https://github.com/mockatoo/examples/actions/workflows/authjs-remix.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/authjs-remix.yml/badge.svg" alt="Auth.js + Remix"></a>
</p>

<p align="center">
  <a href="https://mockatoo.globalunderdog.com">Website</a> ·
  <a href="https://mockatoo.globalunderdog.com/docs">Documentation</a> ·
  <a href="https://github.com/mockatoo/connectors">Connectors</a> ·
  <a href="https://app.mockatoo.globalunderdog.com">Create a free test account</a>
</p>

# Auth.js + Remix

A sign-in example using the default Auth.js JWT session strategy and Mockatoo’s simulated Apple, Google, GitHub, Discord, Facebook, LinkedIn, Microsoft, and X providers. OAuth state and the session are stored in cookies. Auth configuration lives in `app/auth.server.ts`.

Try the [live example](https://mockatoo-authjs-remix.vercel.app). The [Remix guide](https://mockatoo.globalunderdog.com/docs/remix) walks through the setup.

## Run locally

Use Node.js 24 and pnpm 10. Create a test account at [Mockatoo](https://app.mockatoo.globalunderdog.com), then create `.env.local` with `AUTH_SECRET`, `MOCKATOO_TEST_EMAIL`, and `MOCKATOO_TEST_PASSWORD`. Generate the auth secret with `openssl rand -base64 32`. The email and password are only used by the Playwright tests.

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. Run `pnpm test` to exercise sign-in, sign-out, and denied consent (install Chromium first with `pnpm exec playwright install chromium`).

The Remix resource route at `/api/auth/*` passes requests to Auth.js Core. The home route reads the session on the server and renders sign-in and sign-out forms with Auth.js CSRF tokens. Vite reads the committed `.env` at build time to keep the mock enabled in production builds. The app reads `AUTH_SECRET` at runtime.

## Deploy

Deploy this directory to Vercel and set a generated `AUTH_SECRET` in both Production and Preview environments. The committed `.env` keeps the demo on the mock. Auth.js uses the incoming request to determine the callback origin.

## Before production

Delete `MOCKATOO_FORCE` from `.env`. Production then uses the real providers and `pnpm dev` keeps the mock. The bundled Playwright test runs a production build, so run it with `MOCKATOO_FORCE=true pnpm test` after that. Register an OAuth application with each provider and configure its callback as `https://<your-domain>/api/auth/callback/<provider-id>`. Set `AUTH_<PROVIDER>_ID` and `AUTH_<PROVIDER>_SECRET` in the deployment environment (for example, `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`; Microsoft uses `AUTH_MICROSOFT_ENTRA_ID_ID` and `AUTH_MICROSOFT_ENTRA_ID_SECRET`, and X uses `AUTH_TWITTER_ID` and `AUTH_TWITTER_SECRET`). Apple requires its own signed client secret. Configure only providers for which you have credentials, and remove unused providers and buttons.

The app requests basic profile and email access where available. X's OAuth 2.0 user API does not provide an email address, so that option requests `users.read` and the `tweet.read` permission required for its user lookup, and identifies the user by name. Microsoft uses the ID token profile rather than requesting Graph access. Use Mockatoo for development and testing.
