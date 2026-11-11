<p align="center">
  <img src="../mockatoo-logo.png" alt="Mockatoo" width="128" height="128">
</p>

<h1 align="center">Mockatoo</h1>

<p align="center">
  <strong>Test Google, GitHub and Apple sign-in in CI, without getting blocked.</strong>
</p>

<p align="center">
  OAuth testing for the agentic era: one provider for development, E2E tests, CI, and the agents that write them.
</p>

<p align="center">
  <a href="https://github.com/mockatoo/examples/actions/workflows/ci.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
</p>

<p align="center">
  <a href="https://mockatoo.globalunderdog.com">Website</a> ·
  <a href="https://mockatoo.globalunderdog.com/docs">Documentation</a> ·
  <a href="https://github.com/mockatoo/connectors">Connectors</a> ·
  <a href="https://app.mockatoo.globalunderdog.com">Create a test account</a>
</p>

# Better Auth + Next.js

A small App Router sign-in app using Better Auth’s cookie session and Mockatoo’s simulated Apple, Google, GitHub, Discord, Facebook, LinkedIn, Microsoft, and X providers. Auth setup lives in `lib/auth.ts`; no database or in-memory auth state is used.

Live demo: [Better Auth + Next.js](https://mockatoo-better-auth-next.vercel.app).

## Run locally

Use Node.js 24 and pnpm 10. Create a test account at [Mockatoo](https://app.mockatoo.globalunderdog.com), then create `.env.local`:

```sh
BETTER_AUTH_SECRET=<output of openssl rand -base64 32>
MOCK_EMAIL=<your Mockatoo test email>
MOCK_PASSWORD=<your Mockatoo test password>
```

`MOCK_EMAIL` and `MOCK_PASSWORD` are only for Playwright tests. The committed `.env` selects the hosted Mockatoo service for local development.

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. Run the browser test with `pnpm test` after installing Chromium using `pnpm exec playwright install chromium`.

## Deploy

Deploy this directory to Vercel. Set `BETTER_AUTH_SECRET` in the Production and Preview environments using `openssl rand -base64 32`. The app derives its callback origin from the incoming request, so previews and the production alias work without a URL setting. Do not add `MOCKATOO_URL` to Vercel.

## Before production

Mockatoo is for development and testing, not production authentication. Remove `MOCKATOO_URL` to activate the real Better Auth provider configuration in `lib/auth.ts`. Register each OAuth application with its provider and use the callback URL `https://<your-domain>/api/auth/callback/<provider-id>`. Set the corresponding `*_CLIENT_ID` and `*_CLIENT_SECRET` deployment variables: `APPLE`, `GOOGLE`, `GITHUB`, `DISCORD`, `FACEBOOK`, `LINKEDIN`, `MICROSOFT`, and `TWITTER`. Apple requires its provider-specific signed client secret. Microsoft is configured for the `common` tenant. Configure only providers for which you have credentials, and remove unused providers and buttons.
