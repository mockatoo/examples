import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const localURL = `http://localhost:${process.env.PORT || "3000"}`;

export default defineConfig({
	testDir: "./tests",
	use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || localURL },
	webServer: process.env.PLAYWRIGHT_BASE_URL
		? undefined
		: {
				command: "pnpm build && pnpm start",
				url: localURL,
				reuseExistingServer: !process.env.CI,
				timeout: 180000,
			},
});
