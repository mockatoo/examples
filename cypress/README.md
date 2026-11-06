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
  <a href="https://github.com/mockatoo/examples/actions/workflows/ci.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
</p>

<p align="center">
  <a href="https://mockatoo.globalunderdog.com">Website</a> ·
  <a href="https://mockatoo.globalunderdog.com/docs">Documentation</a> ·
  <a href="https://github.com/mockatoo/connectors">Connectors</a> ·
  <a href="https://app.mockatoo.globalunderdog.com">Create a test account</a>
</p>

# Cypress

A Cypress sign-in test for the [Better Auth + Next.js example](../better-auth-next/). It starts that app, signs in through Mockatoo's Google flow, and checks the resulting session.

## Run locally

Use Node.js 24 and pnpm 10. Create a test account at [Mockatoo](https://app.mockatoo.globalunderdog.com), then set the credentials in your shell:

```sh
export CYPRESS_MOCK_EMAIL=<your Mockatoo test email>
export CYPRESS_MOCK_PASSWORD=<your Mockatoo test password>
```

Install the Cypress browser and run the test:

```sh
pnpm install
pnpm exec cypress install
pnpm test
```

The test uses the hosted Mockatoo service by default. To point it at your own Mockatoo instance, set `MOCKATOO_URL` before running the test:

```sh
MOCKATOO_URL=https://your-mockatoo.example.com pnpm test
```

To test your own app, change `baseUrl` in `cypress.config.ts` to its local URL and replace the `start-server-and-test` command in `package.json` with your app's start command. The test expects a Google sign-in button and the session heading shown by the Better Auth example.
