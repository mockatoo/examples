import { expect, test } from "@playwright/test";

const email = process.env.MOCKATOO_TEST_EMAIL ?? "";
const password = process.env.MOCKATOO_TEST_PASSWORD ?? "";

test("+noemail: signs in without an email", async ({ page }) => {
	const address = email.replace("@", `+e2e-${crypto.randomUUID()}.noemail@`);
	// A Discord account registered by phone can lack an email. Auth.js signs
	// the user in anyway; the session has no email.
	await page.goto("/");
	await page.getByRole("button", { name: "Sign in with Discord" }).click();
	await page.getByLabel("Email", { exact: true }).fill(address);
	await page.getByLabel("Password", { exact: true }).fill(password);
	await page.getByRole("button", { name: "Log in with password" }).click();
	await page.getByRole("button", { name: "Authorize" }).click();
	await expect(page.getByRole("heading", { name: "Your session" })).toBeVisible(
		{ timeout: 15_000 },
	);
	const user = JSON.parse(
		(await page.locator("pre code").textContent()) ?? "",
	).user;
	expect(user.name).toBeTruthy();
	expect(user.email ?? null).toBeNull();
});
