import { defineConfig, devices } from "@playwright/test";
import { loadEnv } from "vite";

Object.assign(process.env, loadEnv("development", process.cwd(), ""));

const baseURL = `https://localhost:${process.env.PORT ?? 3000}`;

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	reporter: "list",
	use: {
		baseURL,
		ignoreHTTPSErrors: true,
		trace: "retain-on-failure",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: {
		command: "pnpm build && pnpm preview",
		url: baseURL,
		env: { HTTPS: "true" },
		ignoreHTTPSErrors: true,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
});
