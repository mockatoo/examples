import { expect, test } from "@playwright/test";
import { createAddress, sessionUser, signIn } from "../helpers";

test("+personal: accepts a personal Microsoft account", async ({ page }) => {
	const address = createAddress("personal");
	// The common tenant accepts personal accounts as well as work accounts.
	await signIn(page, "Microsoft", address);
	expect((await sessionUser(page)).email).toBe(address);
});
