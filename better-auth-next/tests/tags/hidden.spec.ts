import { expect, test } from "@playwright/test";
import { createAddress, sessionUser, signIn } from "../helpers";

test("+hidden: accepts Apple's stable private relay address", async ({
	page,
}) => {
	const address = createAddress("hidden");
	// Hide My Email gives the app a relay address instead of the user's real one.
	await signIn(page, "Apple", address);
	const user = await sessionUser(page);
	expect(user.email).toMatch(/@privaterelay\.appleid\.com$/);
	expect(user.emailVerified).toBe(true);
	await page.getByRole("button", { name: "Sign out" }).click();
	await expect(
		page.getByRole("button", { name: "Sign in with Apple" }),
	).toBeVisible();
	await signIn(page, "Apple", address);
	expect((await sessionUser(page)).email).toBe(user.email);
});
