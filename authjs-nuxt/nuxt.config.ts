import { MOCKATOO_URL } from "@mockatoo/connect-authjs";

export default defineNuxtConfig({
	compatibilityDate: "2026-11-04",
	css: ["~/assets/style.css"],
	devtools: { enabled: false },
	// Nuxt loads the non-secret Mockatoo settings from .env at build time.
	runtimeConfig: {
		mockatooForce: process.env.MOCKATOO_FORCE === "true",
		public: { mockatooUrl: MOCKATOO_URL },
	},
	app: { head: { title: "Auth.js + Nuxt 3 | Mockatoo" } },
});
