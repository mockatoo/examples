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
  <a href="https://github.com/mockatoo/examples/actions/workflows/spring-security-spring-boot.yml"><img src="https://github.com/mockatoo/examples/actions/workflows/spring-security-spring-boot.yml/badge.svg" alt="Spring Security + Spring Boot"></a>
</p>

<p align="center">
  <a href="https://mockatoo.globalunderdog.com">Website</a> ·
  <a href="https://mockatoo.globalunderdog.com/docs">Documentation</a> ·
  <a href="https://github.com/mockatoo/connectors">Connectors</a> ·
  <a href="https://app.mockatoo.globalunderdog.com">Create a free test account</a>
</p>

# Spring Security + Spring Boot

This example uses Spring Boot and Spring Security's OAuth2 client to sign in with Google, Microsoft, GitHub, Apple, Discord, LinkedIn, X, and Facebook. The [Mockatoo profile](src/main/resources/application-mockatoo.yml) enables all eight [registrations](src/main/resources/application.yml) and supplies the shared test client credentials. It swaps the issuer for OpenID Connect providers and the authorization, token, and user-info endpoints for OAuth-only providers. Each registration keeps its scopes and callback at `/login/oauth2/code/{registrationId}`.

The [Spring Boot guide](https://mockatoo.globalunderdog.com/docs/spring-boot) walks through the setup.

## Run locally

Install Java 21 and Maven. Start the app with the Mockatoo profile:

```sh
mvn spring-boot:run -Dspring-boot.run.profiles=mockatoo
```

Open http://localhost:8080, choose a provider, and use the email and generated password from your [Mockatoo account](https://app.mockatoo.globalunderdog.com). Mockatoo accepts the localhost callbacks without provider app registration. The app listens on `PORT` when set.

After sign-in, **Your session** shows the provider and selected OpenID Connect claims or OAuth profile attributes as JSON.

## Run the browser tests

Use Node.js 24 and pnpm 10. Set `MOCKATOO_TEST_EMAIL` and `MOCKATOO_TEST_PASSWORD` in the environment or in a git-ignored `.env.local` in this directory. The tests start the app with the Mockatoo profile and cover signing in, seeing your email, signing out, and declining consent for every provider.

```sh
pnpm install
pnpm exec playwright install chromium
pnpm test
```

## Run with real providers

Set `SPRING_PROFILES_ACTIVE` to the registration IDs you want to enable, separated by commas. The default profile is `google`. Set each selected provider's credentials in the runtime environment and register `https://<your-domain>/login/oauth2/code/<registration-id>` with that provider. For local development, use `http://localhost:8080` with providers that allow localhost callbacks.

| Registration ID | Environment variables | Provider setup |
| --- | --- | --- |
| `google` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Create a Google OAuth web client. |
| `microsoft` | `MICROSOFT_TENANT_ID`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` | Register a web application in your Entra tenant. Use a concrete tenant ID so the issuer matches the ID token. |
| `github` | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Register a GitHub OAuth App. The example displays the GitHub name or ID when the profile email is private. |
| `apple` | `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET` | Use a Services ID, an eligible HTTPS return URL, and a signed Apple client-secret JWT. |
| `discord` | `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | Register a Discord OAuth2 application. |
| `linkedin` | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` | Enable Sign In with LinkedIn using OpenID Connect. |
| `x` | `X_CLIENT_ID`, `X_CLIENT_SECRET` | Configure a confidential OAuth 2.0 web app with email access to display the confirmed email. |
| `facebook` | `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET` | Configure Facebook Login with a valid OAuth redirect URI. |

```sh
mvn -B package
java -jar target/spring-boot-example-0.0.1-SNAPSHOT.jar
```

The JAR runs on a standard Java host. Spring uses its default server-side HTTP session for sign-in and login state. Run this example as a single instance. If you deploy behind an HTTPS reverse proxy, configure Spring to use the forwarded scheme and host from that trusted proxy so the callback matches the registered URL.

Apple returns its authorization response as a cross-site POST. When Apple is enabled, the session cookie uses `SameSite=None; Secure` so Spring can check the saved OAuth state. Spring's CSRF exception applies only to that POST callback. The LinkedIn web flow omits PKCE and nonce. X uses Spring's default PKCE and reads the profile from X's nested response.
