import { expect, test } from "@playwright/test";

const email = process.env.MOCKATOO_TEST_EMAIL ?? "";
const password = process.env.MOCKATOO_TEST_PASSWORD ?? "";

test("+private: signs in with a private GitHub email", async ({ page }) => {
	const address = email.replace("@", `+e2e-${crypto.randomUUID()}.private@`);
	// GitHub's public profile has no email; the connector still finds it using
	// the email permission, so the app gets a usable, verified address.
	await page.goto("/");
	await page.getByRole("button", { name: "Sign in with GitHub" }).click();
	await page.getByLabel("Email", { exact: true }).fill(address);
	await page.getByLabel("Password", { exact: true }).fill(password);
	await page.getByRole("button", { name: "Log in with password" }).click();
	await page.getByRole("button", { name: "Authorize" }).click();
	await expect(page.getByRole("heading", { name: "Your session" })).toBeVisible(
		{ timeout: 15_000 },
	);
	expect(
		JSON.parse((await page.locator("pre code").textContent()) ?? "").user,
	).toMatchObject({
		email: address,
		emailVerified: true,
	});
});
