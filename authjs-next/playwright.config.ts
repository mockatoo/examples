import nextEnv from "@next/env";
import { defineConfig } from "@playwright/test";

// The tag specs read MOCKATOO_TEST_EMAIL and MOCKATOO_TEST_PASSWORD from .env.local.
nextEnv.loadEnvConfig(process.cwd());
export default defineConfig({
	testDir: "./tests",
	use: { baseURL: "http://localhost:3000" },
	webServer: {
		command: "pnpm build && pnpm start",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
});
