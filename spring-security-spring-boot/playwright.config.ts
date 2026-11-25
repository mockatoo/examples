import { defineConfig } from "@playwright/test";

const port = process.env.PORT || "8080";
const baseURL = `http://localhost:${port}`;

export default defineConfig({
	testDir: "./tests",
	use: { baseURL },
	webServer: {
		command: "pnpm build && pnpm start",
		env: { PORT: port, SPRING_PROFILES_ACTIVE: "mockatoo" },
		url: baseURL,
		timeout: 120000,
		reuseExistingServer: false,
	},
});
