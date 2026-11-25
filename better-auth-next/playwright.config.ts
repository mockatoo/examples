import { defineConfig } from "@playwright/test";

const localURL = `http://localhost:${process.env.PORT || "3000"}`;

export default defineConfig({
	testDir: "./tests",
	use: { baseURL: localURL },
	webServer: {
		command: "pnpm build && pnpm start",
		url: localURL,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
