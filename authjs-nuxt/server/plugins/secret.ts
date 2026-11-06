export default defineNitroPlugin(() => {
	if (!process.env.AUTH_SECRET) {
		throw new Error(
			"AUTH_SECRET is required. Set it in .env.local or your deployment environment.",
		);
	}
});
