import { expect, test } from "@playwright/test";
import { createAddress, sessionUser, signIn } from "../helpers";

test("+renamed: displays the user's changed email", async ({ page }) => {
	const address = createAddress("renamed");
	const originalAddress = address.replace(".renamed@", "@");
	// Start with the changed address so a previously saved profile cannot hide it.
	// Signing in again without +renamed must reach the same app account.
	await signIn(page, "Google", address);
	const renamed = await sessionUser(page);
	expect(renamed.email).toBe(address);
	await page.getByRole("button", { name: "Sign out" }).click();
	await expect(
		page.getByRole("button", { name: "Sign in with Google" }),
	).toBeVisible();
	await signIn(page, "Google", originalAddress);
	expect((await sessionUser(page)).id).toBe(renamed.id);
});
