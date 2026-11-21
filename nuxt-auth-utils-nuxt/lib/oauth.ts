// Your app would switch on NODE_ENV, so production uses the real providers:
//   const useMock = process.env.NODE_ENV !== "production";
// This demo also runs the mock in production on Vercel, where NODE_ENV is
// always "production", so its committed .env sets MOCKATOO_FORCE=true.
// Delete that line from .env before you ship.
const useMock =
	process.env.NODE_ENV !== "production" ||
	process.env.MOCKATOO_FORCE === "true";
// Optional origin override for Mockatoo's own tests; unset uses the hosted service.
export const mockatooUrl =
	process.env.MOCKATOO_URL || "https://app.mockatoo.globalunderdog.com";

const client = { clientId: "mockatoo", clientSecret: "mockatoo-secret" };
const mock = (path: string) => `${mockatooUrl}/${path}`;

// nuxt-auth-utils reads each provider's endpoints from runtimeConfig.oauth, so
// the mock needs only its URLs and the shared client. Without the mock, the
// module reads NUXT_OAUTH_<PROVIDER>_* at runtime. Microsoft reads the user
// from Graph's OpenID Connect userinfo, which returns name and email.
export const oauth = useMock
	? {
			google: {
				...client,
				authorizationURL: mock("google/o/oauth2/v2/auth"),
				tokenURL: mock("google/token"),
				userURL: mock("google/v1/userinfo"),
			},
			github: {
				...client,
				authorizationURL: mock("github/login/oauth/authorize"),
				tokenURL: mock("github/login/oauth/access_token"),
				apiURL: mock("github/api/v3"),
			},
			facebook: {
				...client,
				authorizationURL: mock("facebook/dialog/oauth"),
				tokenURL: mock("facebook/graph/oauth/access_token"),
				userURL: mock("facebook/graph/me"),
			},
			microsoft: {
				...client,
				tenant: "common",
				authorizationURL: mock(
					"login.microsoftonline.com/common/oauth2/v2.0/authorize",
				),
				tokenURL: mock("login.microsoftonline.com/common/oauth2/v2.0/token"),
				userURL: mock("graph.microsoft.com/oidc/userinfo"),
			},
			x: {
				...client,
				authorizationURL: mock("x/i/oauth2/authorize"),
				tokenURL: mock("x/2/oauth2/token"),
				userURL: mock("x/2/users/me"),
			},
		}
	: { microsoft: { userURL: "https://graph.microsoft.com/oidc/userinfo" } };
