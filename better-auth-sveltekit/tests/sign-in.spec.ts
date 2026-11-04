import { expect, test } from "@playwright/test";

const email = process.env.MOCK_EMAIL;
const password = process.env.MOCK_PASSWORD;

test.beforeEach(() => {
	if (!email || !password)
		throw new Error(
			"Set MOCK_EMAIL and MOCK_PASSWORD in .env.local or the environment.",
		);
});

test("sign in, see the account email, and sign out", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Sign in" }).click();
	await page.locator("#email").fill(email as string);
	await page.locator("#password").fill(password as string);
	await page.getByRole("button", { name: "Log in with password" }).click();
	await page.getByRole("button", { name: "Authorize" }).click();
	await expect(
		page.getByRole("heading", { name: "Your session" }),
	).toBeVisible();
	await expect(page.locator(".email")).toHaveText(email as string);
	await page.getByRole("button", { name: "Sign out" }).click();
	await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("show an error when consent is denied", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Sign in" }).click();
	await page.locator("#email").fill(email as string);
	await page.locator("#password").fill(password as string);
	await page.getByRole("button", { name: "Log in with password" }).click();
	await page.getByRole("button", { name: "Deny" }).click();
	await expect(
		page.getByRole("alert").filter({ hasText: /^Sign-in failed/ }),
	).toBeVisible();
});
