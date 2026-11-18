import { defineConfig } from "@playwright/test";

const deployedURL = process.env.PLAYWRIGHT_BASE_URL;
const port = process.env.PORT || "3000";
const localURL = `http://localhost:${port}`;

export default defineConfig({
	testDir: "./tests",
	use: { baseURL: deployedURL || localURL },
	webServer: deployedURL
		? undefined
		: {
				command: "pnpm build && pnpm start",
				url: localURL,
				timeout: 120000,
			},
});
