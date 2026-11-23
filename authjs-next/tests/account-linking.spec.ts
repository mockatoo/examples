import { expect, test } from "@playwright/test";

const email = process.env.MOCKATOO_TEST_EMAIL ?? "";
const password = process.env.MOCKATOO_TEST_PASSWORD ?? "";

test("refuses a second provider for the same email", async ({ page }) => {
	const address = email.replace("@", `+e2e-${crypto.randomUUID()}@`);
	// Google creates the user. GitHub then returns the same email for a new
	// account, and Auth.js refuses to link it without
	// allowDangerousEmailAccountLinking.
	await page.goto("/");
	await page.getByRole("button", { name: "Sign in with Google" }).click();
	await page.getByLabel("Email", { exact: true }).fill(address);
	await page.getByLabel("Password", { exact: true }).fill(password);
	await page.getByRole("button", { name: "Log in with password" }).click();
	await page.getByRole("button", { name: "Authorize" }).click();
	await expect(page.getByRole("heading", { name: "Your session" })).toBeVisible(
		{ timeout: 15_000 },
	);
	await page.getByRole("button", { name: "Sign out" }).click();
	await expect(
		page.getByRole("button", { name: "Sign in with GitHub" }),
	).toBeVisible();
	await page.goto("/");
	await page.getByRole("button", { name: "Sign in with GitHub" }).click();
	await page.getByLabel("Email", { exact: true }).fill(address);
	await page.getByLabel("Password", { exact: true }).fill(password);
	await page.getByRole("button", { name: "Log in with password" }).click();
	await page.getByRole("button", { name: "Authorize" }).click();
	await expect(page).toHaveURL(
		(url) =>
			url.pathname === "/" &&
			url.searchParams.get("error") === "OAuthAccountNotLinked",
	);
	await expect(
		page.getByRole("alert").filter({ hasText: /^Sign-in failed/ }),
	).toContainText("Use the original provider to sign in.");
	await expect(
		page.getByRole("button", { name: "Sign in with GitHub" }),
	).toBeVisible();
	await expect(page.getByText("You are logged in")).toBeHidden();
	// The original provider still signs the user in.
	await page.goto("/");
	await page.getByRole("button", { name: "Sign in with Google" }).click();
	await page.getByLabel("Email", { exact: true }).fill(address);
	await page.getByLabel("Password", { exact: true }).fill(password);
	await page.getByRole("button", { name: "Log in with password" }).click();
	await page.getByRole("button", { name: "Authorize" }).click();
	await expect(page.getByRole("heading", { name: "Your session" })).toBeVisible(
		{ timeout: 15_000 },
	);
	expect(
		JSON.parse((await page.locator("pre code").textContent()) ?? "").user.email,
	).toBe(address);
});
