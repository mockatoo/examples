import { sendRedirect } from "nuxt/server";

export default defineOAuthFacebookEventHandler({
	config: {
		scope: ["public_profile", "email"],
		fields: ["id", "name", "email"],
	},
	async onSuccess(event, { user }) {
		await setUserSession(event, {
			user: { provider: "facebook", name: user.name, email: user.email },
		});
		return sendRedirect(event, "/");
	},
	onError(event) {
		return sendRedirect(event, "/?error=facebook");
	},
});
