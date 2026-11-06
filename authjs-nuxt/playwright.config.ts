import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
	testDir: "./tests",
	use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000" },
	webServer: process.env.PLAYWRIGHT_BASE_URL
		? undefined
		: {
				command: "pnpm build && pnpm start",
				url: "http://localhost:3000",
				reuseExistingServer: !process.env.CI,
				timeout: 180000,
			},
});
