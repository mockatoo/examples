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
  <a href="https://github.com/mockatoo/examples/actions/workflows/ci.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
</p>

<p align="center">
  <a href="https://mockatoo.globalunderdog.com">Website</a> ·
  <a href="https://mockatoo.globalunderdog.com/docs">Documentation</a> ·
  <a href="https://github.com/mockatoo/connectors">Connectors</a> ·
  <a href="https://app.mockatoo.globalunderdog.com">Create a free test account</a>
</p>

# Hono + oauth4webapi

A minimal framework example exercising raw OAuth/OIDC without an auth abstraction. `src/app.tsx` handles discovery, authorization code flow with PKCE, state and nonce validation, ID-token validation, and user info using oauth4webapi directly. Choose Google, Apple, Microsoft, or LinkedIn. The committed configuration uses each provider’s Mockatoo OIDC endpoint. The committed `.env` turns the mock on in production builds too; `pnpm dev` uses it either way. Hono renders one page through `src/page.tsx`, which holds the markup and styles. Signed, HttpOnly cookies hold short-lived OAuth state and a one-hour session; no database is needed. Tokens stay on the server and are discarded after user info is read.

Try the [live example](https://mockatoo-oauth4webapi-hono.vercel.app).

## Run locally

Use Node.js 24 and pnpm 10. Create `.env.local` with `SESSION_SECRET` (generate it with `openssl rand -base64 32`). Add `MOCK_EMAIL` and `MOCK_PASSWORD` from your [Mockatoo account](https://app.mockatoo.globalunderdog.com) to run the browser tests; the app never uses these credentials.

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. Run `pnpm exec playwright install chromium`, then `pnpm test` to check sign-in, session persistence, sign-out, and denied consent for all four providers.

## Deploy

Deploy this directory to Vercel. The committed `vercel.json` selects Hono and the compiled `dist` output; `src/env.ts` loads the non-secret configuration before the auth routes initialize. Set `SESSION_SECRET` for Production and Preview. The Node entry point also supports `pnpm build && pnpm start` and honors `PORT`. Both entry points load the committed `.env` and optional `.env.local` at runtime. Callback URLs come from the request origin.

## Before production

Delete `MOCKATOO_FORCE` from `.env`. Production then uses the real providers and `pnpm dev` keeps the mock. The bundled Playwright test runs a production build, so run it with `MOCKATOO_FORCE=true pnpm test` after that. Register each provider you want to enable and set its variables below. Providers without credentials are omitted. Callback URLs are `https://<your-domain>/callback/<provider-id>`.

| Provider ID | Environment variables | Setup |
| --- | --- | --- |
| `google` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Register a Google web OAuth client. |
| `apple` | `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET` | Register a Services ID and HTTPS return URL. The secret is an Apple developer-signed client-secret JWT; rotate it before expiry. |
| `microsoft` | `MICROSOFT_ISSUER`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` | Register an Entra web application. Use `https://login.microsoftonline.com/<tenant-GUID>/v2.0` as issuer. |
| `linkedin` | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` | Enable Sign In with LinkedIn using OpenID Connect. |

Optional `GOOGLE_ISSUER`, `APPLE_ISSUER`, and `LINKEDIN_ISSUER` override their standard issuers. Microsoft deliberately uses a fixed tenant (a demo GUID under Mockatoo), so discovery and token issuer validation agree without accepting a tenant placeholder.

Google and Microsoft use S256 PKCE. Apple and LinkedIn do not advertise PKCE; their confidential clients use state and client-secret authentication. LinkedIn’s flow does not request a nonce; the other three providers request and validate one. Apple uses `openid email name`, a `form_post` callback, and email from the validated ID token because it has no user-info endpoint. Its transaction cookie uses `SameSite=None; Secure` for the cross-site POST, which works on HTTPS and Chromium’s trusted localhost. The other providers use `openid profile email` and user info with subject validation. All providers validate the ID token signature, issuer, audience, and expiry.

Use HTTPS in production. Mockatoo is for development and testing, not production authentication.
