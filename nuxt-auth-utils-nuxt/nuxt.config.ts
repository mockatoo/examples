import { mockatooUrl, oauth } from "./lib/oauth";

export default defineNuxtConfig({
	compatibilityDate: "2026-11-04",
	modules: ["nuxt-auth-utils"],
	css: ["~/assets/style.css"],
	devtools: { enabled: false },
	// Nuxt loads the non-secret Mockatoo settings from .env at build time.
	runtimeConfig: { oauth, public: { mockatooUrl } },
	app: { head: { title: "nuxt-auth-utils + Nuxt | Mockatoo" } },
});
