<p align="center">
  <img src="../mockatoo-logo.png" alt="Mockatoo" width="128" height="128">
</p>

<h1 align="center">Mockatoo</h1>

<p align="center">
  Develop and test OAuth flows in the agentic era.
</p>

<p align="center">
  One OAuth provider for development, E2E tests, CI, and the agents that write them.
</p>

<p align="center">
  <a href="https://mockatoo.globalunderdog.com">Website</a> ·
  <a href="https://mockatoo.globalunderdog.com/docs">Documentation</a> ·
  <a href="https://github.com/mockatoo/connectors">Connectors</a> ·
  <a href="https://app.mockatoo.globalunderdog.com">Create a test account</a>
</p>

# Auth.js + Next.js

A sign-in example using the default Auth.js JWT session strategy and Mockatoo’s simulated Apple, Google, GitHub, Discord, Facebook, LinkedIn, Microsoft, and X providers. OAuth state and the session are stored in cookies; there is no database or adapter. Auth configuration lives in `lib/auth.ts`.

Try the [live example](https://mockatoo-authjs-next.vercel.app).

## Run locally

Use Node.js 24 and pnpm 10. Create a test account at [Mockatoo](https://app.mockatoo.globalunderdog.com), then create `.env.local` with `AUTH_SECRET`, `MOCK_EMAIL`, and `MOCK_PASSWORD`. Generate the auth secret with `openssl rand -base64 32`. The email and password are only used by the Playwright tests.

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. Run `pnpm test` to exercise sign-in, sign-out, and denied consent (install Chromium first with `pnpm exec playwright install chromium`).

## Deploy

Deploy this directory to Vercel and set a generated `AUTH_SECRET` in both Production and Preview environments. The committed `.env` enables the hosted Mockatoo service; no deployment URL or provider credentials are needed.

## Before production

Remove `MOCKATOO_URL` from `.env` to use the real Auth.js providers. Register an OAuth application with each provider and configure its callback as `https://<your-domain>/api/auth/callback/<provider-id>`. Set `AUTH_<PROVIDER>_ID` and `AUTH_<PROVIDER>_SECRET` in the deployment environment (for example, `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`; Microsoft uses `AUTH_MICROSOFT_ENTRA_ID_ID` and `AUTH_MICROSOFT_ENTRA_ID_SECRET`, and X uses `AUTH_TWITTER_ID` and `AUTH_TWITTER_SECRET`). Apple requires its own signed client secret. Configure only providers for which you have credentials, and remove unused providers and buttons.

The app requests basic profile and email access where available. X's OAuth 2.0 user API does not provide an email address, so that option requests `users.read` and the `tweet.read` permission required for its user lookup, and identifies the user by name. Microsoft uses the ID token profile rather than requesting Graph access. Mockatoo is for development and testing, not production authentication.
