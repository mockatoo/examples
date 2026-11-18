import { loadEnvFile } from "node:process";
import { expect, test } from "@playwright/test";

try {
	loadEnvFile(".env.local");
} catch (error) {
	if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

for (const provider of [
	"Apple",
	"Discord",
	"Facebook",
	"GitHub",
	"Google",
	"LinkedIn",
	"Microsoft",
	"X",
]) {
	for (const decision of ["Authorize", "Deny"] as const) {
		// The browser follows the redirects and carries the session across origins.
		test(`${provider}: ${decision}`, async ({ page }) => {
			const { MOCKATOO_TEST_EMAIL: email, MOCKATOO_TEST_PASSWORD: password } =
				process.env;
			if (!email || !password)
				throw new Error(
					"Set MOCKATOO_TEST_EMAIL and MOCKATOO_TEST_PASSWORD in .env.local or the environment.",
				);

			await page.goto("/");
			await page
				.getByRole("button", { name: `Sign in with ${provider}`, exact: true })
				.click();
			await page.getByLabel("Email", { exact: true }).fill(email);
			await page.getByLabel("Password", { exact: true }).fill(password);
			await page.getByRole("button", { name: "Log in with password" }).click();
			await page.getByRole("button", { name: decision, exact: true }).click();

			if (decision === "Deny") {
				await expect(page.getByRole("alert")).toHaveText(/^Sign-in failed/);
				return;
			}

			const session = page.locator(".session-json code");
			await expect(
				page.getByRole("heading", { name: "Your session" }),
			).toBeVisible();
			await expect
				.poll(async () =>
					(await session.textContent())?.includes(JSON.stringify(email)),
				)
				.toBe(true);
			await page.reload();
			await expect(session).toBeVisible();
			await page.getByRole("button", { name: "Sign out", exact: true }).click();
			await expect(
				page.getByRole("button", {
					name: `Sign in with ${provider}`,
					exact: true,
				}),
			).toBeVisible();
			await expect(session).toHaveCount(0);
		});
	}
}
