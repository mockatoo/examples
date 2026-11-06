import { defineConfig, devices } from "@playwright/test";
import { loadEnv } from "vite";

Object.assign(process.env, loadEnv("development", process.cwd(), ""));

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	reporter: "list",
	use: {
		baseURL: "http://localhost:3000",
		trace: "retain-on-failure",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: {
		command: "pnpm build && pnpm preview",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
});
