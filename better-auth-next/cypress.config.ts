import { MOCKATOO_URL } from "@mockatoo/connect-better-auth";
import nextEnv from "@next/env";
import { defineConfig } from "cypress";

nextEnv.loadEnvConfig(process.cwd());

export default defineConfig({
	defaultCommandTimeout: 10000,
	expose: { mockatooUrl: MOCKATOO_URL },
	env: {
		MOCKATOO_TEST_EMAIL: process.env.MOCKATOO_TEST_EMAIL,
		MOCKATOO_TEST_PASSWORD: process.env.MOCKATOO_TEST_PASSWORD,
	},
	e2e: {
		baseUrl: "https://localhost:3443",
		supportFile: "cypress/support/e2e.ts",
	},
});
