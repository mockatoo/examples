<p align="center">
  <img src="mockatoo-logo.png" alt="Mockatoo" width="128" height="128">
</p>

<h1 align="center">Mockatoo</h1>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="readme-headline-dark.svg">
    <img src="readme-headline-light.svg" alt="Test Google, Microsoft, GitHub, Apple, Discord, LinkedIn, X and Facebook sign-in in CI, without getting blocked. One free OAuth provider for agentic development, E2E tests, and CI. No app registration, no bot checks, no fragile workarounds." width="880">
  </picture>
</p>

<p align="center">
  <a href="https://github.com/mockatoo/examples/actions/workflows/authjs-next.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/authjs-next.yml/badge.svg" alt="Auth.js + Next.js"></a>
  <a href="https://github.com/mockatoo/examples/actions/workflows/authjs-nuxt.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/authjs-nuxt.yml/badge.svg" alt="Auth.js + Nuxt"></a>
  <a href="https://github.com/mockatoo/examples/actions/workflows/authjs-sveltekit.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/authjs-sveltekit.yml/badge.svg" alt="Auth.js + SvelteKit"></a>
  <a href="https://github.com/mockatoo/examples/actions/workflows/better-auth-next.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/better-auth-next.yml/badge.svg" alt="Better Auth + Next.js"></a>
  <a href="https://github.com/mockatoo/examples/actions/workflows/better-auth-sveltekit.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/better-auth-sveltekit.yml/badge.svg" alt="Better Auth + SvelteKit"></a>
  <a href="https://github.com/mockatoo/examples/actions/workflows/configurations.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/configurations.yml/badge.svg" alt="Configurations"></a>
  <a href="https://github.com/mockatoo/examples/actions/workflows/cypress.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/cypress.yml/badge.svg" alt="Cypress"></a>
  <a href="https://github.com/mockatoo/examples/actions/workflows/oauth4webapi-hono.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/oauth4webapi-hono.yml/badge.svg" alt="oauth4webapi + Hono"></a>
  <a href="https://github.com/mockatoo/examples/actions/workflows/spring-security-spring-boot.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/spring-security-spring-boot.yml/badge.svg" alt="Spring Security + Spring Boot"></a>
  <a href="https://github.com/mockatoo/examples/actions/workflows/authlib-flask.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/authlib-flask.yml/badge.svg" alt="Authlib + Flask"></a>
  <a href="https://github.com/mockatoo/examples/actions/workflows/socialite-laravel.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/socialite-laravel.yml/badge.svg" alt="Laravel + Socialite"></a>
</p>

<p align="center">
  <a href="https://mockatoo.globalunderdog.com">Website</a> ·
  <a href="https://mockatoo.globalunderdog.com/docs">Documentation</a> ·
  <a href="https://github.com/mockatoo/connectors">Connectors</a> ·
  <a href="https://app.mockatoo.globalunderdog.com">Create a free test account</a>
</p>

# Mockatoo examples

Example applications and authentication configurations for [Mockatoo](https://mockatoo.globalunderdog.com).

- [Auth.js + Nuxt 3](authjs-nuxt/): JWT sessions with Auth.js core and Nuxt server routes.
- [Auth.js + Remix](authjs-remix/): JWT sessions with Auth.js Core and Remix resource routes.
- [Auth.js + SvelteKit](authjs-sveltekit/): JWT sessions with Auth.js Core and SvelteKit server routes.
- [Auth.js + Next.js](authjs-next/): JWT sessions with Auth.js.
- [Better Auth + Next.js](better-auth-next/): cookie-based sessions with Better Auth’s provider-specific connectors.
- [Better Auth + SvelteKit](better-auth-sveltekit/): cookie-based sessions with Better Auth’s provider-shaped Mockatoo connectors.
- [Hono + oauth4webapi](oauth4webapi-hono/): minimal framework example exercising raw OAuth/OIDC without an auth abstraction.
- [Spring Security + Spring Boot](spring-security-spring-boot/): sign-in with all eight providers through an opt-in Mockatoo profile and Spring Security’s built-in OAuth2 client.
- [Flask + Authlib](authlib-flask/): Sign-in with eight providers using the same Authlib clients for real and mock endpoints.
- [Laravel + Socialite](socialite-laravel/): Sign-in with eight providers using Socialite and encrypted cookie sessions.
- [Authentication configurations](configurations/): Better Auth and Auth.js setups for SaaS, B2B, connected accounts, and other use cases.

Use Node.js 24 and pnpm 10. Each example has its own README with setup and deployment instructions.

Run `pnpm lint`, `pnpm typecheck`, and `pnpm build` to validate the examples.
Connector source, documentation, and the agent skill live in
[mockatoo/connectors](https://github.com/mockatoo/connectors).
