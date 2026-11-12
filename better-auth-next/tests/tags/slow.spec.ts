import { expect, test } from "@playwright/test";
import { createAddress, sessionUser, signIn } from "../helpers";

test("+slow: waits for sign-in to finish", async ({ page }) => {
	const address = createAddress("slow");
	// A slow provider can still complete sign-in; no exact latency is assumed.
	await signIn(page, "Google", address);
	expect((await sessionUser(page)).email).toBe(address);
});
