import assert from "node:assert/strict";
import { after, before, type TestContext, test } from "node:test";
import type { IWebDriverOptionsCookie } from "selenium-webdriver";
import {
	appUrl,
	openBrowser,
	sessionUser,
	signIn,
	waitForSession,
} from "./helpers.ts";

let cookies: IWebDriverOptionsCookie[];

before(async () => {
	const driver = await openBrowser({ after });
	await signIn(driver, "Google", { tag: "selenium-session" });
	await waitForSession(driver);
	cookies = await driver.manage().getCookies();
});

async function restoreSession(t: TestContext) {
	const driver = await openBrowser(t);
	// WebDriver can only add cookies for the current domain.
	await driver.get(appUrl);
	for (const cookie of cookies) {
		await driver.manage().addCookie(cookie);
	}
	await driver.navigate().refresh();
	return driver;
}

test("starts signed in", async (t) => {
	const driver = await restoreSession(t);
	await waitForSession(driver);
});

test("reuses the same user", async (t) => {
	const driver = await restoreSession(t);
	const user = await sessionUser(driver);
	assert.ok(
		user.email?.includes("+selenium-session@"),
		"Expected the cached test user",
	);
});
