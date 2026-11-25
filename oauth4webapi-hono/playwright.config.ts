import { defineConfig } from "@playwright/test";

const localURL = `http://localhost:${process.env.PORT || "3000"}`;

export default defineConfig({
	testDir: "./tests",
	use: { baseURL: localURL },
	webServer: {
		command: "pnpm build && pnpm start",
		url: localURL,
		timeout: 120000,
		reuseExistingServer: false,
	},
});
