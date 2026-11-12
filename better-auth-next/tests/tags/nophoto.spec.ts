import { expect, test } from "@playwright/test";
import { createAddress, sessionUser, signIn } from "../helpers";

test("+nophoto: signs in without a profile picture", async ({ page }) => {
	const address = createAddress("nophoto");
	// A LinkedIn member without a photo is still a valid user.
	await signIn(page, "LinkedIn", address);
	const user = await sessionUser(page);
	expect(user.email).toBe(address);
	expect(user.image ?? null).toBeNull();
});
