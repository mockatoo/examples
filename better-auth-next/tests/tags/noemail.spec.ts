import { test } from "@playwright/test";
import { createAddress, signIn, signInError } from "../helpers";

test("+noemail: reports that sign-in needs an email", async ({ page }) => {
	const address = createAddress("noemail");
	// A Discord account registered by phone can lack an email. Better Auth
	// cannot create this app's session and returns the user to sign-in.
	await signIn(page, "Discord", address);
	await signInError(
		page,
		"email_not_found",
		"Sign-in failed. Please try again.",
	);
});
