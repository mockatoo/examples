import { expect, test } from "@playwright/test";

const email = process.env.MOCKATOO_TEST_EMAIL ?? "";
const password = process.env.MOCKATOO_TEST_PASSWORD ?? "";

test("+flaky: tells the user to retry when sign-in cannot finish", async ({
	page,
}) => {
	const address = email.replace("@", `+e2e-${crypto.randomUUID()}.flaky@`);
	// Better Auth does not retry a failed code exchange. Even though a retry
	// could succeed, the app sees invalid_code and asks the user to try again.
	await page.goto("/");
	await page.getByRole("button", { name: "Sign in with Google" }).click();
	await page.getByLabel("Email", { exact: true }).fill(address);
	await page.getByLabel("Password", { exact: true }).fill(password);
	await page.getByRole("button", { name: "Log in with password" }).click();
	await page.getByRole("button", { name: "Authorize" }).click();
	await expect(page).toHaveURL(
		(url) =>
			url.pathname === "/" && url.searchParams.get("error") === "invalid_code",
	);
	await expect(
		page.getByRole("alert").filter({
			hasText: "Sign-in failed before it finished. Try again in a minute.",
		}),
	).toHaveText("Sign-in failed before it finished. Try again in a minute.");
	await expect(
		page.getByRole("button", { name: "Sign in with Google" }),
	).toBeVisible();
	await expect(page.getByText("You are logged in")).toBeHidden();
});
