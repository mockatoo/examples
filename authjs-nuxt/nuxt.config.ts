export default defineNuxtConfig({
	compatibilityDate: "2026-11-04",
	css: ["~/assets/style.css"],
	devtools: { enabled: false },
	// Nuxt loads .env at build time; only the non-secret origin is bundled.
	runtimeConfig: { mockatooUrl: process.env.MOCKATOO_URL || "" },
	app: { head: { title: "Auth.js + Nuxt 3 | Mockatoo" } },
});
