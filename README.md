# Mockatoo examples

Example applications and authentication configurations for [Mockatoo](https://mockatoo.com).

- [Better Auth + Next.js](better-auth-next/): a runnable sign-in app.
- [Authentication configurations](configurations/): Better Auth and Auth.js setups for SaaS, B2B, connected accounts, and other use cases.

Use Node.js 24 and pnpm 10:

```sh
pnpm install --no-frozen-lockfile
MOCKATOO_URL=https://app.mockatoo.globalunderdog.com pnpm dev
```

The app starts on port 4002 with development HTTPS. The command above connects to the hosted
Mockatoo service; omit `MOCKATOO_URL` to use the local provider on port 4001. See [the auth configuration](better-auth-next/lib/auth.ts)
for environment variables.

Connectors are installed from `github:mockatoo/connectors#main`, using
`@mockatoo/connectors/better-auth` and `@mockatoo/connectors/authjs`. They are not
published to npm yet. This repository temporarily follows GitHub `main` without
a committed lockfile; installations resolve the latest exported connectors.

Run `pnpm lint`, `pnpm typecheck`, and `pnpm build` to validate the examples.
Connector source, documentation, and the agent skill live in
[mockatoo/connectors](https://github.com/mockatoo/connectors).
