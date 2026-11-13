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

# Cypress

A Cypress sign-in test for the [Better Auth + Next.js example](../better-auth-next/). It starts that app, signs in through Mockatoo's Google flow, and checks the resulting session.

## Run locally

Use Node.js 24 and pnpm 10. From the examples repository root, install dependencies and generate a runtime secret for the app:

```sh
pnpm install
export BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
```

Create a test account at [Mockatoo](https://app.mockatoo.globalunderdog.com), then set the credentials in your shell:

```sh
export CYPRESS_MOCK_EMAIL=<your Mockatoo test email>
export CYPRESS_MOCK_PASSWORD=<your Mockatoo test password>
```

Install Cypress and run the test from the examples repository root:

```sh
pnpm --dir cypress exec cypress install
pnpm --dir cypress test
```

The test builds and starts the app in production mode on port 3000, then serves it through a local HTTPS proxy at `https://localhost:3443`. The proxy uses a bundled self-signed certificate; no certificate setup is needed. Both servers stop when the test finishes.

The test uses the hosted Mockatoo service by default. To point it at your own Mockatoo instance, set `MOCKATOO_URL` before running the test:

```sh
MOCKATOO_URL=https://your-mockatoo.example.com pnpm --dir cypress test
```

To test your own app, change `baseUrl` in `cypress.config.ts` to its local URL and replace the `start-server-and-test` command in `package.json` with your app's start command. The test expects a Google sign-in button and the session heading shown by the Better Auth example.

## Why Cypress needs HTTPS

Better Auth uses Secure cookies in production mode, including the OAuth state cookie needed to complete sign-in. The Playwright examples let Chromium handle these cookies directly. Chromium makes an exception for `http://localhost`, allowing Secure cookies there, so those tests can use HTTP.

Cypress also maintains a server-side cookie jar for cross-origin flows. In Cypress 16.2, its bundled cookie library does not apply the localhost exception: it omits Secure cookies from HTTP requests. When sign-in returns from Mockatoo to an HTTP localhost callback, the OAuth state cookie is missing and Better Auth reports `state_mismatch` with `auth state cookie not found`.

The local HTTPS proxy lets both Chromium and Cypress's cookie jar send the Secure cookie. This keeps the Cypress example on a production build, consistent with the Playwright examples.
