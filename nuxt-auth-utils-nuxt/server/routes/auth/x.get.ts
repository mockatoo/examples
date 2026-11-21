import { sendRedirect } from "nuxt/server";

export default defineOAuthXEventHandler({
	// X's OAuth 2.0 user API has no email, so the session holds the name.
	config: { scope: ["users.read", "tweet.read"] },
	async onSuccess(event, { user }) {
		await setUserSession(event, { user: { provider: "x", name: user.name } });
		return sendRedirect(event, "/");
	},
	onError(event) {
		return sendRedirect(event, "/?error=x");
	},
});
