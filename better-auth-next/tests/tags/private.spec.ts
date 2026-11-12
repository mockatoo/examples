import { expect, test } from "@playwright/test";
import { createAddress, sessionUser, signIn } from "../helpers";

test("+private: signs in with a private GitHub email", async ({ page }) => {
	const address = createAddress("private");
	// GitHub's public profile has no email; the connector still finds it using
	// the email permission, so the app gets a usable, verified address.
	await signIn(page, "GitHub", address);
	expect(await sessionUser(page)).toMatchObject({
		email: address,
		emailVerified: true,
	});
});
