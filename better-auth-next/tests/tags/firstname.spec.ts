import { expect, test } from "@playwright/test";
import { createAddress, sessionUser, signIn } from "../helpers";

test("+firstname: displays a name without a surname", async ({ page }) => {
	const address = createAddress("firstname");
	// The app must accept a profile with only a first name.
	await signIn(page, "Google", address);
	const user = await sessionUser(page);
	expect(user.email).toBe(address);
	expect(user.name.trim().split(/\s+/)).toHaveLength(1);
	expect(user.name).not.toBe("");
});
