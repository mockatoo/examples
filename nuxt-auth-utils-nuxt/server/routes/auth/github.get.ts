import { sendRedirect } from "nuxt/server";

export default defineOAuthGitHubEventHandler({
	config: { scope: ["read:user", "user:email"], emailRequired: true },
	async onSuccess(event, { user }) {
		await setUserSession(event, {
			user: {
				provider: "github",
				name: user.name ?? user.login,
				email: user.email ?? undefined,
			},
		});
		return sendRedirect(event, "/");
	},
	onError(event) {
		return sendRedirect(event, "/?error=github");
	},
});
