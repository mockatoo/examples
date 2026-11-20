import assert from "node:assert/strict";
import nextEnv from "@next/env";
import { Builder, By, until, type WebDriver } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

nextEnv.loadEnvConfig(process.cwd());
export const appUrl = "http://localhost:3000";
export const timeout = 15_000;
export const button = (label: string) =>
	By.xpath(`//button[normalize-space(.)="${label}"]`);

export async function openBrowser(t: {
	after(cleanup: () => Promise<void>): void;
}) {
	const options = new chrome.Options();
	options.addArguments("--headless");
	const driver = await new Builder()
		.forBrowser("chrome")
		.setChromeOptions(options)
		.build();
	t.after(() => driver.quit());
	return driver;
}

export async function signIn(
	driver: WebDriver,
	provider: string,
	{
		tag,
		consent = "Authorize",
	}: { tag?: string; consent?: "Authorize" | "Deny" } = {},
) {
	const email = process.env.MOCKATOO_TEST_EMAIL;
	const password = process.env.MOCKATOO_TEST_PASSWORD;
	if (!email || !password) {
		throw new Error(
			"Set MOCKATOO_TEST_EMAIL and MOCKATOO_TEST_PASSWORD in .env.local or the environment.",
		);
	}

	const address = tag ? email.replace("@", `+${tag}@`) : email;
	await driver.get(appUrl);
	await driver
		.wait(until.elementLocated(button(`Sign in with ${provider}`)), timeout)
		.click();
	await driver
		.wait(until.elementLocated(By.id("email")), timeout)
		.sendKeys(address);
	await driver.findElement(By.id("password")).sendKeys(password);
	await driver.findElement(button("Log in with password")).click();
	await driver.wait(until.elementLocated(button(consent)), timeout).click();
	return address;
}

export async function waitForSession(driver: WebDriver) {
	const heading = await driver.wait(
		until.elementLocated(By.xpath('//h1[normalize-space(.)="Your session"]')),
		timeout,
	);
	await driver.wait(until.elementIsVisible(heading), timeout);
}

export async function sessionUser(driver: WebDriver) {
	await waitForSession(driver);
	const session: { user: { email?: string; emailVerified?: boolean } } =
		JSON.parse(await driver.findElement(By.css("pre code")).getText());
	return session.user;
}

export async function expectSignInError(
	driver: WebDriver,
	error: string,
	message: string,
) {
	const alert = await driver.wait(
		until.elementLocated(By.css('[role="alert"]')),
		timeout,
	);
	assert.equal(
		new URL(await driver.getCurrentUrl()).searchParams.get("error"),
		error,
	);
	assert.equal(await alert.getText(), message);
}
