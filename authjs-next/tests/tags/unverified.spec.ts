import { expect, test } from "@playwright/test";

const email = process.env.MOCKATOO_TEST_EMAIL ?? "";
const password = process.env.MOCKATOO_TEST_PASSWORD ?? "";

test("+unverified: refuses an unverified email", async ({ page }) => {
	const address = email.replace("@", `+e2e-${crypto.randomUUID()}.unverified@`);
	// The example's signIn callback returns false for email_verified: false,
	// which Auth.js reports as AccessDenied.
	await page.goto("/");
	await page.getByRole("button", { name: "Sign in with Google" }).click();
	await page.getByLabel("Email", { exact: true }).fill(address);
	await page.getByLabel("Password", { exact: true }).fill(password);
	await page.getByRole("button", { name: "Log in with password" }).click();
	await page.getByRole("button", { name: "Authorize" }).click();
	await expect(page).toHaveURL(
		(url) =>
			url.pathname === "/" && url.searchParams.get("error") === "AccessDenied",
	);
	await expect(
		page.getByRole("alert").filter({ hasText: /^Sign-in failed/ }),
	).toContainText("Access to this account was denied.");
	await expect(
		page.getByRole("button", { name: "Sign in with Google" }),
	).toBeVisible();
	await expect(page.getByText("You are logged in")).toBeHidden();
});
