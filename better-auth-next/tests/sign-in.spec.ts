import nextEnv from "@next/env";
import { expect, test } from "@playwright/test";

nextEnv.loadEnvConfig(process.cwd());
const email = process.env.MOCKATOO_TEST_EMAIL;
const password = process.env.MOCKATOO_TEST_PASSWORD;

test.beforeEach(() => {
	if (!email || !password)
		throw new Error(
			"Set MOCKATOO_TEST_EMAIL and MOCKATOO_TEST_PASSWORD in .env.local or the environment.",
		);
});

for (const provider of [
	"Apple",
	"Google",
	"GitHub",
	"Discord",
	"Facebook",
	"LinkedIn",
	"Microsoft",
	"X",
] as const) {
	test(`sign in with ${provider}`, async ({ page }) => {
		await page.goto("/");
		await page
			.getByRole("button", { name: `Sign in with ${provider}` })
			.click();
		await page.locator("#email").fill(email as string);
		await page.locator("#password").fill(password as string);
		await page.getByRole("button", { name: "Log in with password" }).click();
		await page.getByRole("button", { name: "Authorize" }).click();
		await expect(
			page.getByRole("heading", { name: "Your session" }),
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Explore Mockatoo" }),
		).toHaveAttribute("href", "https://app.mockatoo.globalunderdog.com");
		await expect(page.locator("pre code")).toContainText('"user"');
		await expect(page.getByText("You are logged in")).toBeVisible();
		await page.getByRole("button", { name: "Sign out" }).click();
		await expect(
			page.getByRole("button", { name: `Sign in with ${provider}` }),
		).toBeVisible();
	});
}

test("sign in with Google: Deny", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Sign in with Google" }).click();
	await page.locator("#email").fill(email as string);
	await page.locator("#password").fill(password as string);
	await page.getByRole("button", { name: "Log in with password" }).click();
	await page.getByRole("button", { name: "Deny" }).click();
	await expect(
		page.getByRole("alert").filter({ hasText: /^Sign-in failed/ }),
	).toBeVisible();
});
