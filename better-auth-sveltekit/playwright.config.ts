import { defineConfig, devices } from "@playwright/test";
import { loadEnv } from "vite";

Object.assign(process.env, loadEnv("development", process.cwd(), ""));

const localURL = `http://localhost:${process.env.PORT || "3000"}`;

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	reporter: "list",
	use: {
		baseURL: localURL,
		trace: "retain-on-failure",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: {
		command: "pnpm build && pnpm preview",
		url: localURL,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
});
