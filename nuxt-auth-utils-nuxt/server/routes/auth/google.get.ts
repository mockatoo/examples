import { sendRedirect } from "nuxt/server";

export default defineOAuthGoogleEventHandler({
	config: { scope: ["openid", "profile", "email"] },
	async onSuccess(event, { user }) {
		await setUserSession(event, {
			user: { provider: "google", name: user.name, email: user.email },
		});
		return sendRedirect(event, "/");
	},
	onError(event) {
		return sendRedirect(event, "/?error=google");
	},
});
