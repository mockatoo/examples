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
for (const [provider, decision] of [
	["Apple", "Authorize"],
	["Google", "Authorize"],
	["GitHub", "Authorize"],
	["Discord", "Authorize"],
	["Facebook", "Authorize"],
	["LinkedIn", "Authorize"],
	["Microsoft", "Authorize"],
	["X", "Authorize"],
	["Google", "Deny"],
] as const) {
	test(`sign in with ${provider}: ${decision}`, async ({ page }) => {
		await page.goto("/");
		await page
			.getByRole("button", { name: `Sign in with ${provider}` })
			.click();
		await page.locator("#email").fill(email as string);
		await page.locator("#password").fill(password as string);
		await page.getByRole("button", { name: "Log in with password" }).click();
		await page.getByRole("button", { name: decision }).click();
		if (decision === "Deny") {
			await expect(
				page.getByRole("alert").filter({ hasText: /^Sign-in failed/ }),
			).toContainText("You may have declined the authorization request");
			return;
		}
		await expect(
			page.getByRole("heading", { name: "Your session" }),
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Explore Mockatoo" }),
		).toHaveAttribute("href", "https://app.mockatoo.globalunderdog.com");
		await expect(
			page.getByRole("link", { name: "Explore Mockatoo" }),
		).toHaveAttribute("target", "_blank");
		await expect(page.locator("pre code")).toContainText('"user"');
		await expect(page.getByText("You are logged in")).toBeVisible();
		await page.getByRole("button", { name: "Sign out" }).click();
		await expect(
			page.getByRole("button", { name: `Sign in with ${provider}` }),
		).toBeVisible();
	});
}
