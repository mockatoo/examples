import { defineConfig } from "cypress";

const mockatooUrl =
	process.env.MOCKATOO_URL ?? "https://app.mockatoo.globalunderdog.com";

export default defineConfig({
	defaultCommandTimeout: 10000,
	e2e: {
		baseUrl: "https://localhost:3443",
		supportFile: false,
	},
	env: {
		MOCKATOO_URL: mockatooUrl,
	},
	expose: {
		MOCKATOO_URL: mockatooUrl,
	},
});
