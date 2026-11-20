import { expect, test } from "@playwright/test";

const email = process.env.MOCKATOO_TEST_EMAIL ?? "";
const password = process.env.MOCKATOO_TEST_PASSWORD ?? "";

test("+renamed: displays the user's changed email", async ({ page }) => {
	const address = email.replace("@", `+e2e-${crypto.randomUUID()}.renamed@`);
	const originalAddress = address.replace(".renamed@", "@");
	// Start with the changed address so a previously saved profile cannot hide it.
	// Signing in again without +renamed must reach the same app account.
	await page.goto("/");
	await page.getByRole("button", { name: "Sign in with Google" }).click();
	await page.getByLabel("Email", { exact: true }).fill(address);
	await page.getByLabel("Password", { exact: true }).fill(password);
	await page.getByRole("button", { name: "Log in with password" }).click();
	await page.getByRole("button", { name: "Authorize" }).click();
	await expect(page.getByRole("heading", { name: "Your session" })).toBeVisible(
		{ timeout: 15_000 },
	);
	const renamed = JSON.parse(
		(await page.locator("pre code").textContent()) ?? "",
	).user;
	expect(renamed.email).toBe(address);
	await page.getByRole("button", { name: "Sign out" }).click();
	await expect(
		page.getByRole("button", { name: "Sign in with Google" }),
	).toBeVisible();
	await page.goto("/");
	await page.getByRole("button", { name: "Sign in with Google" }).click();
	await page.getByLabel("Email", { exact: true }).fill(originalAddress);
	await page.getByLabel("Password", { exact: true }).fill(password);
	await page.getByRole("button", { name: "Log in with password" }).click();
	await page.getByRole("button", { name: "Authorize" }).click();
	await expect(page.getByRole("heading", { name: "Your session" })).toBeVisible(
		{ timeout: 15_000 },
	);
	expect(
		JSON.parse((await page.locator("pre code").textContent()) ?? "").user.id,
	).toBe(renamed.id);
});
