import { defineEventHandler, getQuery, sendRedirect } from "nuxt/server";

// nuxt-auth-utils's Google, Microsoft and X handlers ignore the callback's
// ?error=, so a declined consent would start sign-in again. Send it home.
export default defineEventHandler((event) => {
	if (event.path.startsWith("/auth/") && getQuery(event).error) {
		return sendRedirect(event, "/?error=access_denied");
	}
});
