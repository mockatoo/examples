import { expect, test } from "@playwright/test";
import { createAddress, sessionUser, signIn } from "../helpers";

test("+guest: accepts a Microsoft guest", async ({ page }) => {
	const address = createAddress("guest");
	// This app uses the common tenant. It accepts guests without requiring
	// membership in a particular organization's tenant.
	await signIn(page, "Microsoft", address);
	expect((await sessionUser(page)).email).toBe(address);
});
