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
  <a href="https://github.com/mockatoo/examples/actions/workflows/nextjs.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/nextjs.yml/badge.svg" alt="Auth.js + Next.js"></a>
</p>

<p align="center">
  <a href="https://mockatoo.globalunderdog.com">Website</a> ·
  <a href="https://mockatoo.globalunderdog.com/docs">Documentation</a> ·
  <a href="https://github.com/mockatoo/connectors">Connectors</a> ·
  <a href="https://app.mockatoo.globalunderdog.com">Create a free test account</a>
</p>

# Auth.js + Next.js

A sign-in example using the default Auth.js JWT session strategy and Mockatoo’s simulated Apple, Google, GitHub, Discord, Facebook, LinkedIn, Microsoft, and X providers. OAuth state and the session are stored in cookies; there is no database or adapter. Auth configuration lives in `lib/auth.ts`.

Try the [live example](https://mockatoo-authjs-next.vercel.app).

## Run locally

Use Node.js 24 and pnpm 10. Create a test account at [Mockatoo](https://app.mockatoo.globalunderdog.com), then create `.env.local` with `AUTH_SECRET`, `MOCKATOO_TEST_EMAIL`, and `MOCKATOO_TEST_PASSWORD`. Generate the auth secret with `openssl rand -base64 32`. The email and password are only used by the browser tests.

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. The committed `.env` turns the mock on in production builds too; `pnpm dev` uses it either way.

## Browser tests

Set `MOCKATOO_TEST_EMAIL` and `MOCKATOO_TEST_PASSWORD` in `.env.local` or export them in your shell. Keep the runtime secret from the local setup above. From this example's directory, run the suite you want:

| Runner | First-time setup | Run |
| --- | --- | --- |
| Playwright | `pnpm exec playwright install chromium` | `pnpm test` |
| Cypress | `pnpm exec cypress install` | `pnpm test:cypress` |
| Selenium | Install Google Chrome. Selenium Manager resolves ChromeDriver. | `pnpm test:selenium` |

Each runner can start its own production build. Stop your dev server first so port 3000 is free. Cypress also uses port 3443 for local HTTPS. Its start command sets `AUTH_URL` to the proxy’s HTTPS URL so Auth.js sends the same callback URL in the authorization request and token exchange.

## Deploy

Deploy this directory to Vercel and set a generated `AUTH_SECRET` in both Production and Preview environments. The committed `.env` keeps the demo on the mock; no deployment URL or provider credentials are needed.

## Before production

Delete `MOCKATOO_FORCE` from `.env`. Production then uses the real providers and `pnpm dev` keeps the mock. Register an OAuth application with each provider and configure its callback as `https://<your-domain>/api/auth/callback/<provider-id>`. Set `AUTH_<PROVIDER>_ID` and `AUTH_<PROVIDER>_SECRET` in the deployment environment (for example, `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`; Microsoft uses `AUTH_MICROSOFT_ENTRA_ID_ID` and `AUTH_MICROSOFT_ENTRA_ID_SECRET`, and X uses `AUTH_TWITTER_ID` and `AUTH_TWITTER_SECRET`). Apple requires its own signed client secret. Configure only providers for which you have credentials, and remove unused providers and buttons.

After deleting the flag, prefix your browser test command with `MOCKATOO_FORCE=true`.

The app requests basic profile and email access where available. X's OAuth 2.0 user API does not provide an email address, so that option requests `users.read` and the `tweet.read` permission required for its user lookup, and identifies the user by name. Microsoft uses the ID token profile rather than requesting Graph access. Mockatoo is for development and testing, not production authentication.
