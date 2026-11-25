import nextEnv from "@next/env";
import { defineConfig } from "@playwright/test";

// The tag specs read MOCKATOO_TEST_EMAIL and MOCKATOO_TEST_PASSWORD from .env.local.
nextEnv.loadEnvConfig(process.cwd());
const localURL = `http://localhost:${process.env.PORT || "3000"}`;

export default defineConfig({
	testDir: "./tests",
	use: { baseURL: localURL },
	webServer: {
		command: "pnpm build && pnpm start",
		url: localURL,
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
});
