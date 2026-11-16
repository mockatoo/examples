import { defineConfig } from "cypress";

export default defineConfig({
	defaultCommandTimeout: 10000,
	e2e: {
		baseUrl: "https://localhost:3443",
		supportFile: "cypress/support/e2e.ts",
	},
});
