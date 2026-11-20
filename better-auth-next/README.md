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
  <a href="https://github.com/mockatoo/examples/actions/workflows/nextjs.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/nextjs.yml/badge.svg" alt="Better Auth + Next.js"></a>
</p>

<p align="center">
  <a href="https://mockatoo.globalunderdog.com">Website</a> ·
  <a href="https://mockatoo.globalunderdog.com/docs">Documentation</a> ·
  <a href="https://github.com/mockatoo/connectors">Connectors</a> ·
  <a href="https://app.mockatoo.globalunderdog.com">Create a free test account</a>
</p>

# Better Auth + Next.js

A small App Router sign-in app using Better Auth’s cookie session and Mockatoo’s simulated Apple, Google, GitHub, Discord, Facebook, LinkedIn, Microsoft, and X providers. Auth setup lives in `lib/auth.ts`; no database or in-memory auth state is used.

Live demo: [Better Auth + Next.js](https://mockatoo-better-auth-next.vercel.app).

## Run locally

Use Node.js 24 and pnpm 10. Create a test account at [Mockatoo](https://app.mockatoo.globalunderdog.com), then create `.env.local`:

```sh
BETTER_AUTH_SECRET=<output of openssl rand -base64 32>
MOCKATOO_TEST_EMAIL=<your Mockatoo test email>
MOCKATOO_TEST_PASSWORD=<your Mockatoo test password>
```

`MOCKATOO_TEST_EMAIL` and `MOCKATOO_TEST_PASSWORD` are only for browser tests. The committed `.env` turns the mock on in production builds too; `pnpm dev` uses it either way.

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Browser tests

Set `MOCKATOO_TEST_EMAIL` and `MOCKATOO_TEST_PASSWORD` in `.env.local` or export them in your shell. Keep the runtime secret from the local setup above. From this example's directory, run the suite you want:

| Runner | First-time setup | Run |
| --- | --- | --- |
| Playwright | `pnpm exec playwright install chromium` | `pnpm test` |
| Cypress | `pnpm exec cypress install` | `pnpm test:cypress` |
| Selenium | Install Google Chrome. Selenium Manager resolves ChromeDriver. | `pnpm test:selenium` |

Each runner can start its own production build. Stop your dev server first so port 3000 is free. Cypress also uses port 3443 for local HTTPS.

The [Cypress specs](cypress/e2e/) show a minimal Google sign-in, all eight providers, session caching, and edge cases. The [Cypress guide](https://mockatoo.globalunderdog.com/docs/cypress) walks through them. The [Selenium specs](selenium/) cover the same scenarios, plus sign-out in the Google test. The [Selenium guide](https://mockatoo.globalunderdog.com/docs/selenium) walks through the WebDriver setup and cookie restoration.

### Why Cypress needs HTTPS

Better Auth uses Secure cookies in production, including the OAuth state cookie. Chromium accepts those cookies on HTTP localhost, but Cypress's server-side cookie jar drops them from HTTP requests. The test serves the app through a local HTTPS proxy at `https://localhost:3443` so the state cookie reaches the callback.

## Deploy

Deploy this directory to Vercel. Set `BETTER_AUTH_SECRET` in the Production and Preview environments using `openssl rand -base64 32`. The app derives its callback origin from the incoming request, so previews and the production alias work without a URL setting. The committed `.env` keeps the demo on the mock.

## Before production

Mockatoo is for development and testing, not production authentication. Delete `MOCKATOO_FORCE` from `.env`. Production then uses the real providers and `pnpm dev` keeps the mock. After deleting the flag, prefix your browser test command with `MOCKATOO_FORCE=true`. Register each OAuth application with its provider and use the callback URL `https://<your-domain>/api/auth/callback/<provider-id>`. Set the corresponding `*_CLIENT_ID` and `*_CLIENT_SECRET` deployment variables: `APPLE`, `GOOGLE`, `GITHUB`, `DISCORD`, `FACEBOOK`, `LINKEDIN`, `MICROSOFT`, and `TWITTER`. Apple requires its provider-specific signed client secret. Microsoft is configured for the `common` tenant. Configure only providers for which you have credentials, and remove unused providers and buttons.
