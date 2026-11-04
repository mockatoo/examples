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

# Better Auth + Next.js

A small App Router sign-in app using Better Auth’s cookie session and Mockatoo’s generic OAuth connector. Auth setup lives in `lib/auth.ts`; no database or in-memory auth state is used.

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

Mockatoo is for development and testing, not production authentication. Remove `MOCKATOO_URL` and the Mockatoo plugin, then configure Better Auth with your production OAuth provider and a persistent database. Add the provider credentials and database settings as deployment secrets, and register the callback URL for your domain with that provider.
