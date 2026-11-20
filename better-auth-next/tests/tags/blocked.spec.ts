import { expect, test } from "@playwright/test";

const email = process.env.MOCKATOO_TEST_EMAIL ?? "";
const password = process.env.MOCKATOO_TEST_PASSWORD ?? "";

test("+blocked: does not create an app session when an admin blocks consent", async ({
	page,
}) => {
	const address = email.replace("@", `+e2e-${crypto.randomUUID()}.blocked@`);
	// Admin policy stops the user at Google before they can authorize the app.
	await page.goto("/");
	await page.getByRole("button", { name: "Sign in with Google" }).click();
	await page.getByLabel("Email", { exact: true }).fill(address);
	await page.getByLabel("Password", { exact: true }).fill(password);
	await page.getByRole("button", { name: "Log in with password" }).click();
	await expect(
		page.getByRole("heading", { name: /Access blocked/ }),
	).toBeVisible();
	await expect(page.getByRole("button", { name: "Authorize" })).toBeHidden();
	// Returning to the app still shows sign-in, because no callback succeeded.
	await page.goto("/");
	await expect(
		page.getByRole("button", { name: "Sign in with Google" }),
	).toBeVisible();
	await expect(page.getByText("You are logged in")).toBeHidden();
});
