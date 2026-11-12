import { expect, test } from "@playwright/test";
import { createAddress, sessionUser, signIn } from "../helpers";

test("+outsider: accepts a Microsoft user outside an organization", async ({
	page,
}) => {
	const address = createAddress("outsider");
	// Outsiders are rejected by single-tenant apps. This app uses common, so
	// there is no organization membership restriction to reject this user.
	await signIn(page, "Microsoft", address);
	expect((await sessionUser(page)).email).toBe(address);
});
