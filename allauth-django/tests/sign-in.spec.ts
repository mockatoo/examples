import { loadEnvFile } from "node:process";
import { expect, test } from "@playwright/test";

try {
	loadEnvFile(".env.local");
} catch (error) {
	if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

for (const provider of [
	"Apple",
	"Google",
	"GitHub",
	"Discord",
	"Facebook",
	"LinkedIn",
	"Microsoft",
	"X",
]) {
	for (const decision of ["Authorize", "Deny"] as const) {
		test(`${provider}: ${decision}`, async ({ page }) => {
			const { MOCKATOO_TEST_EMAIL: email, MOCKATOO_TEST_PASSWORD: password } =
				process.env;
			if (!email || !password)
				throw new Error(
					"Set MOCKATOO_TEST_EMAIL and MOCKATOO_TEST_PASSWORD in .env.local or the environment.",
				);

			await page.goto("/");
			const signIn = page.getByRole("button", {
				name: `Sign in with ${provider}`,
				exact: true,
			});
			await signIn.click();
			await page.getByLabel("Email", { exact: true }).fill(email);
			await page.getByLabel("Password", { exact: true }).fill(password);
			await page.getByRole("button", { name: "Log in with password" }).click();
			await page.getByRole("button", { name: decision, exact: true }).click();

			if (decision === "Deny") {
				await expect(page.getByRole("alert")).toHaveText(/^Sign-in failed/);
				await expect(signIn).toBeVisible();
				return;
			}

			await expect(page.getByText(email)).toBeVisible();
			await page.reload();
			await expect(page.getByText(email)).toBeVisible();
			await page.getByRole("button", { name: "Sign out", exact: true }).click();
			await expect(signIn).toBeVisible();
			await expect(page.getByText(email)).toHaveCount(0);
		});
	}
}
