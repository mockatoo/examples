import { expect, test } from "@playwright/test";
import { createAddress, sessionUser, signIn } from "../helpers";

test("+throttled: reports a refresh failure after successful sign-in", async ({
	page,
}) => {
	const address = createAddress("throttled");
	// Microsoft can throttle refresh after initial sign-in succeeds. Better Auth
	// exposes a generic refresh failure, without the provider's Retry-After header.
	await signIn(page, "Microsoft", address);
	expect((await sessionUser(page)).email).toBe(address);
	// Exercise the app's public auth API with the browser's session cookies.
	const response = await page.request.post("/api/auth/refresh-token", {
		data: { useAccountCookie: true },
		headers: { Origin: new URL(page.url()).origin },
	});
	expect(response.status()).toBe(400);
	expect(await response.json()).toMatchObject({
		code: "FAILED_TO_REFRESH_ACCESS_TOKEN",
		message: "Failed to refresh access token",
	});
	// Refresh failure alone does not end the app's cookie session.
	await page.reload();
	expect((await sessionUser(page)).email).toBe(address);
});
