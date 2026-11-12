import { expect, test } from "@playwright/test";
import { createAddress, sessionUser, signIn } from "../helpers";

test("+strings: normalizes Apple's string verification flag", async ({
	page,
}) => {
	const address = createAddress("strings");
	// Apple's string-valued claims still become a boolean in the app's session.
	await signIn(page, "Apple", address);
	expect(await sessionUser(page)).toMatchObject({
		email: address,
		emailVerified: true,
	});
});
