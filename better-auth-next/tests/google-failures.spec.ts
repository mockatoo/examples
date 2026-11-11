import nextEnv from "@next/env";
import { expect, type Page, test } from "@playwright/test";

nextEnv.loadEnvConfig(process.cwd());
const email = process.env.MOCK_EMAIL ?? "";
const password = process.env.MOCK_PASSWORD ?? "";

// you@example.com -> you+down@example.com
const withTag = (tag: string) => email.replace("@", `+${tag}@`);

async function signInWithGoogle(page: Page, address: string) {
	await page.goto("/");
	await page.getByRole("button", { name: "Sign in with Google" }).click();
	await page.locator("#email").fill(address);
	await page.locator("#password").fill(password);
	await page.getByRole("button", { name: "Log in with password" }).click();
	await page.getByRole("button", { name: "Authorize" }).click();
}

test("tells the user to retry when Google's token endpoint is down", async ({
	page,
}) => {
	await signInWithGoogle(page, withTag("down"));
	await expect(page).toHaveURL(/\?error=invalid_code$/);
	await expect(
		page.getByRole("alert").filter({ hasText: "Try again in a minute" }),
	).toBeVisible();
	await expect(page.getByText("You are logged in")).toBeHidden();
});

test("waits out a slow token endpoint", async ({ page }) => {
	await signInWithGoogle(page, withTag("slow"));
	await expect(page.getByText("You are logged in")).toBeVisible({
		timeout: 15_000,
	});
});
