<p align="center">
  <img src="mockatoo-logo.png" alt="Mockatoo" width="128" height="128">
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

# Mockatoo examples

Example applications and authentication configurations for [Mockatoo](https://mockatoo.globalunderdog.com).

- [Auth.js + Next.js](authjs-next/): JWT sessions with Auth.js.
- [Better Auth + Next.js](better-auth-next/): a runnable sign-in app.
- [Authentication configurations](configurations/): Better Auth and Auth.js setups for SaaS, B2B, connected accounts, and other use cases.

Use Node.js 24 and pnpm 10:

```sh
pnpm install
MOCKATOO_URL=https://app.mockatoo.globalunderdog.com pnpm dev
```

The app starts on port 4002 with development HTTPS. The command above connects to the hosted
Mockatoo service; omit `MOCKATOO_URL` to use the local provider on port 4001. See [the auth configuration](better-auth-next/lib/auth.ts)
for environment variables.

Connectors are installed from `github:mockatoo/connectors#main`, using
`@mockatoo/connectors/better-auth` and `@mockatoo/connectors/authjs`. They are not
published to npm yet. The committed lockfile pins a connectors commit; run
`pnpm update @mockatoo/connectors` to move to the latest exported connectors.

Run `pnpm lint`, `pnpm typecheck`, and `pnpm build` to validate the examples.
Connector source, documentation, and the agent skill live in
[mockatoo/connectors](https://github.com/mockatoo/connectors).
