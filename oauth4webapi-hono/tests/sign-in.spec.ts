import { loadEnvFile } from "node:process";
import { expect, test } from "@playwright/test";

try {
	loadEnvFile(".env.local");
} catch (error) {
	if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}
const email = process.env.MOCKATOO_TEST_EMAIL;
const password = process.env.MOCKATOO_TEST_PASSWORD;
test.beforeEach(() => {
	if (!email || !password)
		throw new Error(
			"Set MOCKATOO_TEST_EMAIL and MOCKATOO_TEST_PASSWORD in .env.local or the environment.",
		);
});
for (const provider of ["Google", "Apple", "Microsoft", "LinkedIn"]) {
	for (const decision of ["Authorize", "Deny"] as const) {
		test(`${provider}: ${decision}`, async ({ page }) => {
			await page.goto("/");
			await page
				.getByRole("button", { name: `Sign in with ${provider}`, exact: true })
				.click();
			await page.getByLabel("Email", { exact: true }).fill(email as string);
			await page
				.getByLabel("Password", { exact: true })
				.fill(password as string);
			await page.getByRole("button", { name: "Log in with password" }).click();
			await page.getByRole("button", { name: decision, exact: true }).click();
			if (decision === "Deny") {
				await expect(page.getByRole("alert")).toHaveText(/^Sign-in failed/);
				return;
			}
			await expect(
				page.getByText(email as string, { exact: false }),
			).toBeVisible();
			await page.reload();
			await page.getByRole("button", { name: "Sign out", exact: true }).click();
			await expect(
				page.getByRole("button", {
					name: `Sign in with ${provider}`,
					exact: true,
				}),
			).toBeVisible();
		});
	}
}
