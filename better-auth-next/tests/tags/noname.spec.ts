import { expect, test } from "@playwright/test";
import { createAddress, sessionUser, signIn } from "../helpers";

test("+noname: signs in without a display name", async ({ page }) => {
	const address = createAddress("noname");
	// Better Auth represents Google's missing name as an empty string.
	await signIn(page, "Google", address);
	expect(await sessionUser(page)).toMatchObject({
		email: address,
		name: "",
	});
});
