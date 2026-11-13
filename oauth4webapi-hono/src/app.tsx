import "./env.js";
import { Hono } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import * as oauth from "oauth4webapi";
import { Page } from "./page.js";

const secret = process.env.SESSION_SECRET;
if (!secret || secret.length < 32) {
	throw new Error(
		"Set SESSION_SECRET to a random secret of at least 32 characters.",
	);
}
const mock = process.env.MOCKATOO_URL;
const providers = [
	{
		id: "google",
		name: "Google",
		path: "/google",
		issuer: "https://accounts.google.com",
		scope: "openid profile email",
		pkce: true,
	},
	{
		id: "apple",
		name: "Apple",
		path: "/apple",
		issuer: "https://appleid.apple.com",
		scope: "openid email name",
		pkce: false,
	},
	{
		id: "microsoft",
		name: "Microsoft",
		// A fixed tenant keeps discovery and token issuer checks exact.
		path: "/login.microsoftonline.com/00000000-0000-4000-8000-000000000001/v2.0",
		issuer: "",
		scope: "openid profile email",
		pkce: true,
	},
	{
		id: "linkedin",
		name: "LinkedIn",
		path: "/linkedin/oauth",
		issuer: "https://www.linkedin.com/oauth",
		scope: "openid profile email",
		pkce: false,
	},
]
	.map((provider) => {
		const prefix = provider.id.toUpperCase();
		const issuer = mock
			? new URL(provider.path, mock).href
			: process.env[`${prefix}_ISSUER`] || provider.issuer;
		const client: oauth.Client = {
			client_id: mock ? "mockatoo" : process.env[`${prefix}_CLIENT_ID`] || "",
		};
		const clientSecret = mock
			? "mockatoo-secret"
			: process.env[`${prefix}_CLIENT_SECRET`] || "";
		return { ...provider, issuer, client, clientSecret };
	})
	.filter(
		(provider) =>
			provider.issuer && provider.client.client_id && provider.clientSecret,
	);
if (!providers.length)
	throw new Error("Configure provider credentials or MOCKATOO_URL.");
const options =
	mock &&
	new URL(mock).protocol === "http:" &&
	["localhost", "127.0.0.1"].includes(new URL(mock).hostname)
		? { [oauth.allowInsecureRequests]: true as const }
		: {};
const metadata = async (issuer: string) => {
	const url = new URL(issuer);
	return oauth.processDiscoveryResponse(
		url,
		await oauth.discoveryRequest(url, options),
	);
};
const app = new Hono();
const cookieOptions = (url: string, maxAge: number) => ({
	httpOnly: true,
	secure: new URL(url).protocol === "https:",
	sameSite: "Lax" as const,
	path: "/",
	maxAge,
});

app.get("/", async (c) => {
	const value = await getSignedCookie(c, secret, "session");
	let email: string | undefined;
	if (value) {
		try {
			const session = JSON.parse(value);
			if (session.expires > Date.now() && typeof session.email === "string")
				email = session.email;
		} catch {
			/* Invalid cookies render the signed-out page. */
		}
	}
	return c.html(Page({ email, error: c.req.query("error"), providers }));
});

app.use("/sign-*", async (c, next) => {
	if (
		c.req.method === "POST" &&
		c.req.header("origin") !== new URL(c.req.url).origin
	)
		return c.text("Invalid origin", 403);
	await next();
});
app.post("/sign-in", async (c) => {
	try {
		const body = await c.req.parseBody();
		const provider = providers.find((item) => item.id === body.provider);
		if (!provider) return c.text("Unknown provider", 400);
		const { client } = provider;
		const server = await metadata(provider.issuer);
		// State binds the callback to this browser; nonce binds the ID token,
		// and PKCE binds the code exchange to the verifier kept in the cookie.
		const verifier = oauth.generateRandomCodeVerifier();
		const state = oauth.generateRandomState();
		const nonce = oauth.generateRandomNonce();
		await setSignedCookie(
			c,
			"transaction",
			JSON.stringify({
				provider: provider.id,
				verifier,
				state,
				nonce,
				expires: Date.now() + 600_000,
			}),
			secret,
			// Apple posts across sites; SameSite=None requires Secure (localhost is trusted by browsers).
			provider.id === "apple"
				? { ...cookieOptions(c.req.url, 600), sameSite: "None", secure: true }
				: cookieOptions(c.req.url, 600),
		);
		if (!server.authorization_endpoint)
			throw new Error("Missing authorization endpoint");
		const url = new URL(server.authorization_endpoint);
		// Apple needs form_post for email/name. Apple and LinkedIn omit PKCE;
		// LinkedIn also omits nonce in this flow.
		url.search = new URLSearchParams({
			client_id: client.client_id,
			redirect_uri: new URL(`/callback/${provider.id}`, c.req.url).href,
			response_type: "code",
			scope: provider.scope,
			state,
			...(provider.id === "linkedin" ? {} : { nonce }),
			...(provider.pkce
				? {
						code_challenge: await oauth.calculatePKCECodeChallenge(verifier),
						code_challenge_method: "S256",
					}
				: {}),
			...(provider.id === "apple" ? { response_mode: "form_post" } : {}),
		}).toString();
		return c.redirect(url.href);
	} catch {
		return c.redirect("/?error=sign-in");
	}
});
app.on(["GET", "POST"], "/callback/:provider", async (c) => {
	const value = await getSignedCookie(c, secret, "transaction");
	deleteCookie(c, "transaction", { path: "/" });
	try {
		if (!value) throw new Error("Missing OAuth transaction");
		const transaction = JSON.parse(value);
		if (transaction.expires <= Date.now())
			throw new Error("Expired OAuth transaction");
		const provider = providers.find(
			(item) =>
				item.id === transaction.provider && item.id === c.req.param("provider"),
		);
		if (!provider) throw new Error("Invalid provider");
		if ((provider.id === "apple") !== (c.req.method === "POST"))
			throw new Error("Invalid response mode");
		const { client, clientSecret } = provider;
		const server = await metadata(provider.issuer);
		const callback =
			c.req.method === "POST"
				? new URLSearchParams(await c.req.text())
				: new URL(c.req.url);
		// Validate state before exchanging the code. The cookie also binds the
		// callback to the selected provider, including Apple’s cross-site POST.
		const parameters = oauth.validateAuthResponse(
			server,
			client,
			callback,
			transaction.state,
		);
		// Apple and LinkedIn require the client secret in the form body.
		const response = await oauth.authorizationCodeGrantRequest(
			server,
			client,
			provider.id === "apple" || provider.id === "linkedin"
				? oauth.ClientSecretPost(clientSecret)
				: oauth.ClientSecretBasic(clientSecret),
			parameters,
			new URL(`/callback/${provider.id}`, c.req.url).href,
			provider.pkce ? transaction.verifier : oauth.nopkce,
			options,
		);
		// Check ID-token claims and nonce, then verify its signature using JWKS.
		const tokens = await oauth.processAuthorizationCodeResponse(
			server,
			client,
			response,
			{
				expectedNonce:
					provider.id === "linkedin" ? undefined : transaction.nonce,
				requireIdToken: true,
			},
		);
		await oauth.validateApplicationLevelSignature(server, response, options);
		const claims = oauth.getValidatedIdTokenClaims(tokens);
		if (!claims) throw new Error("Missing ID token");
		// Apple has no user-info endpoint; its validated ID token supplies email.
		// For the others, user info must belong to the same subject as the token.
		let email = claims.email;
		if (provider.id !== "apple") {
			const userResponse = await oauth.userInfoRequest(
				server,
				client,
				tokens.access_token,
				options,
			);
			const user = await oauth.processUserInfoResponse(
				server,
				client,
				claims.sub,
				userResponse,
			);
			email = user.email;
		}
		if (typeof email !== "string") throw new Error("Missing email");
		// Keep only the display identity in a signed, expiring session; discard tokens.
		await setSignedCookie(
			c,
			"session",
			JSON.stringify({ email, expires: Date.now() + 3_600_000 }),
			secret,
			cookieOptions(c.req.url, 3600),
		);
		return c.redirect("/");
	} catch {
		return c.redirect("/?error=callback");
	}
});
app.post("/sign-out", (c) => {
	deleteCookie(c, "session", { path: "/" });
	return c.redirect("/");
});
export default app;
