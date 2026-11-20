import assert from "node:assert/strict";
import { test } from "node:test";
import { until } from "selenium-webdriver";
import {
	button,
	openBrowser,
	sessionUser,
	signIn,
	timeout,
} from "./helpers.ts";

test("signs in with Google and signs out", async (t) => {
	const driver = await openBrowser(t);
	const address = await signIn(driver, "Google");
	const user = await sessionUser(driver);
	assert.ok(
		user.email === address,
		"Expected the signed-in email in the session",
	);

	await driver.findElement(button("Sign out")).click();
	await driver.wait(
		until.elementLocated(button("Sign in with Google")),
		timeout,
	);
});
