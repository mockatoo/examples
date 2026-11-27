import { loadEnvFile } from "node:process";
import { expect, test } from "@playwright/test";

try {
	loadEnvFile(".env.local");
} catch (error) {
	if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

test("+badcode: catches ClientException and sends the user back to sign in", async ({
	page,
}) => {
	const { MOCKATOO_TEST_EMAIL: email, MOCKATOO_TEST_PASSWORD: password } =
		process.env;
	if (!email || !password)
		throw new Error(
			"Set MOCKATOO_TEST_EMAIL and MOCKATOO_TEST_PASSWORD in .env.local or the environment.",
		);

	const address = email.replace("@", `+e2e-${crypto.randomUUID()}.badcode@`);
	// Google rejects the authorization code with 400 invalid_grant, which makes
	// Socialite's Guzzle client throw ClientException. The callback catches it
	// and redirects to /?error=oauth so the user sees a retry message.
	await page.goto("/");
	await page
		.getByRole("button", { name: "Sign in with Google", exact: true })
		.click();
	await page.getByLabel("Email", { exact: true }).fill(address);
	await page.getByLabel("Password", { exact: true }).fill(password);
	await page.getByRole("button", { name: "Log in with password" }).click();
	await page.getByRole("button", { name: "Authorize", exact: true }).click();
	await expect(page).toHaveURL(
		(url) => url.pathname === "/" && url.searchParams.get("error") === "oauth",
	);
	await expect(page.getByRole("alert")).toHaveText(
		"Sign-in failed. Authorization was declined or could not be verified. Please try again.",
	);
	await expect(
		page.getByRole("button", { name: "Sign in with Google", exact: true }),
	).toBeVisible();
	await expect(page.getByText("You are logged in")).toBeHidden();
});
