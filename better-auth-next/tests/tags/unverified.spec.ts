import { expect, test } from "@playwright/test";
import { createAddress, sessionUser, signIn } from "../helpers";

test("+unverified: keeps an unverified email unverified", async ({ page }) => {
	const address = createAddress("unverified");
	// Sign-in is allowed, but an app must not treat this address as verified.
	await signIn(page, "Google", address);
	expect(await sessionUser(page)).toMatchObject({
		email: address,
		emailVerified: false,
	});
});
