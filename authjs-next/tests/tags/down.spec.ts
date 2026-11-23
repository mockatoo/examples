import { expect, test } from "@playwright/test";

const email = process.env.MOCKATOO_TEST_EMAIL ?? "";
const password = process.env.MOCKATOO_TEST_PASSWORD ?? "";

// Auth.js hides most code-exchange errors behind ?error=Configuration, but its
// Microsoft provider reads the token response itself and reports
// OAuthCallbackError.
for (const [provider, error] of [
	["Google", "Configuration"],
	["Microsoft", "OAuthCallbackError"],
] as const) {
	test(`+down: reports a token endpoint outage (${provider})`, async ({
		page,
	}) => {
		const address = email.replace("@", `+e2e-${crypto.randomUUID()}.down@`);
		// The token endpoint returns 503, which looks like a bad code to the user.
		await page.goto("/");
		await page
			.getByRole("button", { name: `Sign in with ${provider}` })
			.click();
		await page.getByLabel("Email", { exact: true }).fill(address);
		await page.getByLabel("Password", { exact: true }).fill(password);
		await page.getByRole("button", { name: "Log in with password" }).click();
		await page.getByRole("button", { name: "Authorize" }).click();
		await expect(page).toHaveURL(
			(url) => url.pathname === "/" && url.searchParams.get("error") === error,
		);
		await expect(
			page.getByRole("alert").filter({ hasText: /^Sign-in failed/ }),
		).toContainText(
			error === "Configuration"
				? "Please try again later"
				: "the provider may have encountered an error",
		);
		await expect(
			page.getByRole("button", { name: `Sign in with ${provider}` }),
		).toBeVisible();
		await expect(page.getByText("You are logged in")).toBeHidden();
	});
}
