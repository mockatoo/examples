import nextEnv from "@next/env";
import { expect, test } from "@playwright/test";

nextEnv.loadEnvConfig(process.cwd());
const email = process.env.MOCK_EMAIL;
const password = process.env.MOCK_PASSWORD;

test.beforeEach(() => {
	if (!email || !password)
		throw new Error(
			"Set MOCK_EMAIL and MOCK_PASSWORD in .env.local or the environment.",
		);
});

for (const decision of ["Authorize", "Deny"] as const) {
	test(`Mockatoo consent: ${decision}`, async ({ page }) => {
		await page.goto("/");
		await page.getByRole("button", { name: "Sign in" }).click();
		await page.locator("#email").fill(email as string);
		await page.locator("#password").fill(password as string);
		await page.getByRole("button", { name: "Log in with password" }).click();
		await page.getByRole("button", { name: decision }).click();
		if (decision === "Deny") {
			await expect(page.getByRole("alert")).toContainText(/^Sign-in failed/);
			return;
		}
		await expect(page.getByText(email as string)).toBeVisible();
		await page.getByRole("button", { name: "Sign out" }).click();
		await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
	});
}
