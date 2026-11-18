import { defineConfig } from "@playwright/test";

const baseURL = "http://localhost:8080";

export default defineConfig({
	testDir: "./tests",
	use: { baseURL },
	webServer: {
		command: "pnpm build && pnpm start",
		env: { PORT: "8080", SPRING_PROFILES_ACTIVE: "mockatoo" },
		url: baseURL,
		timeout: 120000,
		reuseExistingServer: false,
	},
});
