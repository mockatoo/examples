import { expect, test } from "@playwright/test";

const email = process.env.MOCKATOO_TEST_EMAIL ?? "";
const password = process.env.MOCKATOO_TEST_PASSWORD ?? "";

test("+noemail: reports that sign-in needs an email", async ({ page }) => {
	const address = email.replace("@", `+e2e-${crypto.randomUUID()}.noemail@`);
	// A Discord account registered by phone can lack an email. Better Auth
	// cannot create this app's session and returns the user to sign-in.
	await page.goto("/");
	await page.getByRole("button", { name: "Sign in with Discord" }).click();
	await page.getByLabel("Email", { exact: true }).fill(address);
	await page.getByLabel("Password", { exact: true }).fill(password);
	await page.getByRole("button", { name: "Log in with password" }).click();
	await page.getByRole("button", { name: "Authorize" }).click();
	await expect(page).toHaveURL(
		(url) =>
			url.pathname === "/" &&
			url.searchParams.get("error") === "email_not_found",
	);
	await expect(
		page
			.getByRole("alert")
			.filter({ hasText: "Sign-in failed. Please try again." }),
	).toHaveText("Sign-in failed. Please try again.");
	await expect(
		page.getByRole("button", { name: "Sign in with Google" }),
	).toBeVisible();
	await expect(page.getByText("You are logged in")).toBeHidden();
});
