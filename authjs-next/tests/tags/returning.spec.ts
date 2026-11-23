import { expect, test } from "@playwright/test";

const email = process.env.MOCKATOO_TEST_EMAIL ?? "";
const password = process.env.MOCKATOO_TEST_PASSWORD ?? "";

test("+returning: signs in an Apple user without a first-time name", async ({
	page,
}) => {
	const address = email.replace("@", `+e2e-${crypto.randomUUID()}.returning@`);
	// Apple sends the name only on first consent, and a returning user keeps
	// their original email. Auth.js falls back to the email as the name.
	await page.goto("/");
	await page.getByRole("button", { name: "Sign in with Apple" }).click();
	await page.getByLabel("Email", { exact: true }).fill(address);
	await page.getByLabel("Password", { exact: true }).fill(password);
	await page.getByRole("button", { name: "Log in with password" }).click();
	await page.getByRole("button", { name: "Authorize" }).click();
	await expect(page.getByRole("heading", { name: "Your session" })).toBeVisible(
		{ timeout: 15_000 },
	);
	const originalAddress = address.replace(".returning@", "@");
	expect(
		JSON.parse((await page.locator("pre code").textContent()) ?? "").user,
	).toMatchObject({
		email: originalAddress,
		name: originalAddress,
	});
});
