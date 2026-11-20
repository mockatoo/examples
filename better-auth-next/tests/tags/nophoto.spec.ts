import { expect, test } from "@playwright/test";

const email = process.env.MOCKATOO_TEST_EMAIL ?? "";
const password = process.env.MOCKATOO_TEST_PASSWORD ?? "";

test("+nophoto: signs in without a profile picture", async ({ page }) => {
	const address = email.replace("@", `+e2e-${crypto.randomUUID()}.nophoto@`);
	// A LinkedIn member without a photo is still a valid user.
	await page.goto("/");
	await page.getByRole("button", { name: "Sign in with LinkedIn" }).click();
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
	expect(user.email).toBe(address);
	expect(user.image ?? null).toBeNull();
});
