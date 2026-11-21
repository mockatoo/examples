export default defineNitroPlugin(() => {
	// Nuxt generates an app secret in development; builds need one set.
	if (!import.meta.dev && !process.env.NUXT_APP_SECRET) {
		throw new Error(
			"NUXT_APP_SECRET is required. Set it in .env.local or your deployment environment.",
		);
	}
});
