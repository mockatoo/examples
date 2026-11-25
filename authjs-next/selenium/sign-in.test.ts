import assert from "node:assert/strict";
import { test } from "node:test";
import nextEnv from "@next/env";
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

nextEnv.loadEnvConfig(process.cwd());
const email = process.env.MOCKATOO_TEST_EMAIL;
const password = process.env.MOCKATOO_TEST_PASSWORD;
const button = (label: string) =>
	By.xpath(`//button[normalize-space(.)="${label}"]`);

for (const decision of ["Authorize", "Deny"]) {
	test(`Google sign-in: ${decision}`, { timeout: 90_000 }, async () => {
		if (!email || !password) {
			throw new Error(
				"Set MOCKATOO_TEST_EMAIL and MOCKATOO_TEST_PASSWORD in .env.local or the environment.",
			);
		}
		const options = new chrome.Options();
		options.addArguments("--headless");
		const driver = await new Builder()
			.forBrowser("chrome")
			.setChromeOptions(options)
			.build();

		try {
			await driver.get(`http://localhost:${process.env.PORT || "3000"}`);
			await driver
				.wait(until.elementLocated(button("Sign in with Google")), 15_000)
				.click();
			await driver
				.wait(until.elementLocated(By.id("email")), 15_000)
				.sendKeys(email);
			await driver.findElement(By.id("password")).sendKeys(password);
			await driver.findElement(button("Log in with password")).click();
			await driver.wait(until.elementLocated(button(decision)), 15_000).click();

			if (decision === "Deny") {
				const alert = await driver.wait(
					until.elementLocated(By.css('[role="alert"]')),
					15_000,
				);
				assert.match(await alert.getText(), /^Sign-in failed/);
				return;
			}

			const session = await driver.wait(
				until.elementLocated(By.css("pre code")),
				15_000,
			);
			assert.ok(
				(await session.getText()).includes(email),
				"Expected the signed-in email in the session",
			);
			await driver.findElement(button("Sign out")).click();
			await driver.wait(
				until.elementLocated(button("Sign in with Google")),
				15_000,
			);
		} finally {
			await driver.quit();
		}
	});
}
