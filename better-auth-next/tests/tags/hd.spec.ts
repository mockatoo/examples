import { expect, test } from "@playwright/test";
import { createAddress, sessionUser, signIn } from "../helpers";

test("+hd: signs in a Google Workspace user", async ({ page }) => {
	const address = createAddress("hd");
	// Workspace membership does not restrict this app; it accepts the user's email.
	await signIn(page, "Google", address);
	expect(await sessionUser(page)).toMatchObject({
		email: address,
		emailVerified: true,
	});
});
