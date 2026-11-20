import { test } from "node:test";
import { openBrowser, signIn, waitForSession } from "./helpers.ts";

const providers = [
	"Apple",
	"Google",
	"GitHub",
	"Discord",
	"Facebook",
	"LinkedIn",
	"Microsoft",
	"X",
];

for (const provider of providers) {
	test(`signs in with ${provider}`, async (t) => {
		const driver = await openBrowser(t);
		await signIn(driver, provider);
		await waitForSession(driver);
	});
}
