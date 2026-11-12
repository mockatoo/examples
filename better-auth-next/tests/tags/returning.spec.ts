import { expect, test } from "@playwright/test";
import { createAddress, sessionUser, signIn } from "../helpers";

test("+returning: signs in an Apple user without a first-time name", async ({
	page,
}) => {
	const address = createAddress("returning");
	const originalAddress = address.replace(".returning@", "@");
	// Apple sends the name only on first consent. A returning user keeps their
	// original email. Start with a fresh app account so no saved name can hide
	// the missing name in this sign-in.
	await signIn(page, "Apple", address);
	expect(await sessionUser(page)).toMatchObject({
		email: originalAddress,
		name: "",
	});
});
