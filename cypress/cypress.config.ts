import { defineConfig } from "cypress";

const mockatooUrl =
	process.env.MOCKATOO_URL ?? "https://app.mockatoo.globalunderdog.com";

export default defineConfig({
	e2e: {
		baseUrl: "http://localhost:3000",
		supportFile: false,
	},
	env: {
		MOCKATOO_URL: mockatooUrl,
	},
	expose: {
		MOCKATOO_URL: mockatooUrl,
	},
});
