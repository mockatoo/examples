import assert from "node:assert/strict";
import { test } from "node:test";
import {
	expectSignInError,
	openBrowser,
	sessionUser,
	signIn,
} from "./helpers.ts";

test("signs in as a tagged address", async (t) => {
	const driver = await openBrowser(t);
	const address = await signIn(driver, "Google", { tag: "selenium-1" });
	const user = await sessionUser(driver);
	assert.ok(user.email === address, "Expected the tagged email in the session");
});

test("+unverified: keeps an unverified email unverified", async (t) => {
	const driver = await openBrowser(t);
	const address = await signIn(driver, "Google", { tag: "unverified" });
	const user = await sessionUser(driver);
	assert.ok(
		user.email === address,
		"Expected the unverified email in the session",
	);
	assert.equal(user.emailVerified, false);
});

test("+down: shows a retry message when the token endpoint is down", async (t) => {
	const driver = await openBrowser(t);
	await signIn(driver, "Google", { tag: "down" });
	await expectSignInError(
		driver,
		"invalid_code",
		"Sign-in failed before it finished. Try again in a minute.",
	);
});

test("Deny: returns access_denied to the app", async (t) => {
	const driver = await openBrowser(t);
	await signIn(driver, "Google", { consent: "Deny" });
	await expectSignInError(
		driver,
		"access_denied",
		"Sign-in failed because you cancelled it.",
	);
});
