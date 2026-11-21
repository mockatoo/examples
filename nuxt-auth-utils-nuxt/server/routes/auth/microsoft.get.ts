import { sendRedirect } from "nuxt/server";

export default defineOAuthMicrosoftEventHandler({
	config: { scope: ["openid", "profile", "email"] },
	async onSuccess(event, { user }) {
		await setUserSession(event, {
			user: { provider: "microsoft", name: user.name, email: user.email },
		});
		return sendRedirect(event, "/");
	},
	onError(event) {
		return sendRedirect(event, "/?error=microsoft");
	},
});
