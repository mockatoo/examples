<p align="center">
  <img src="../mockatoo-logo.png" alt="Mockatoo" width="128" height="128">
</p>

<h1 align="center">Mockatoo</h1>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../readme-headline-dark.svg">
    <img src="../readme-headline-light.svg" alt="Test Google, Microsoft, GitHub, Apple, Discord, LinkedIn, X and Facebook sign-in in CI, without getting blocked. OAuth testing for the agentic era: one provider for development, E2E tests, CI, and the agents that write them." width="880">
  </picture>
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

# Better Auth + SvelteKit

A small SvelteKit sign-in app using Better Auth’s cookie session and Mockatoo’s simulated Apple, Google, GitHub, Discord, Facebook, LinkedIn, Microsoft, and X providers. Auth setup lives in `src/lib/auth.ts`; no database or in-memory auth state is used.

Live demo: [Better Auth + SvelteKit](https://mockatoo-better-auth-sveltekit.vercel.app).

## Run locally

Use Node.js 24 and pnpm 10. Create a test account at [Mockatoo](https://app.mockatoo.globalunderdog.com), then create `.env.local`:

```sh
BETTER_AUTH_SECRET=<output of openssl rand -base64 32>
MOCK_EMAIL=<your Mockatoo test email>
MOCK_PASSWORD=<your Mockatoo test password>
```

`MOCK_EMAIL` and `MOCK_PASSWORD` are only for browser tests. The committed `.env` selects the hosted Mockatoo service for local development.

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. Run the browser tests with `pnpm test` after installing Chromium using `pnpm exec playwright install chromium`.

## Deploy

Deploy this directory to Vercel with the SvelteKit framework preset. Set `BETTER_AUTH_SECRET` in the Production and Preview environments using `openssl rand -base64 32`. SvelteKit reads this secret at runtime, while `MOCKATOO_URL` is read from `.env` at build time. The app derives its callback origin from the incoming request, so previews and the production alias work without a URL setting. Do not add `MOCKATOO_URL` to Vercel.

## Apple and SvelteKit CSRF

Apple returns to `/api/auth/callback/apple` with a cross-site form POST (`response_mode=form_post`). SvelteKit rejects cross-site form POSTs with `Cross-site POST form submissions are forbidden` before Better Auth sees the request, so `svelte.config.js` adds Apple's origin to `kit.csrf.trustedOrigins`: the `MOCKATOO_URL` origin while the mock is enabled, and `https://appleid.apple.com` once it is removed. `pnpm dev` skips this check, so the error appears only in `pnpm build` output and deployments.

## Before production

Mockatoo is for development and testing, not production authentication. Remove the `MOCKATOO_URL` line from `.env` before deploying to activate the real Better Auth provider configuration in `src/lib/auth.ts`. Register each OAuth application with its provider and use the callback URL `https://<your-domain>/api/auth/callback/<provider-id>`. Set the corresponding `*_CLIENT_ID` and `*_CLIENT_SECRET` deployment variables: `APPLE`, `GOOGLE`, `GITHUB`, `DISCORD`, `FACEBOOK`, `LINKEDIN`, `MICROSOFT`, and `TWITTER`. Apple requires its provider-specific signed client secret. Microsoft is configured for the `common` tenant. Configure only providers for which you have credentials, and remove unused providers and buttons.
