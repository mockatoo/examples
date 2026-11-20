import { expect, test } from "@playwright/test";

const email = process.env.MOCKATOO_TEST_EMAIL ?? "";
const password = process.env.MOCKATOO_TEST_PASSWORD ?? "";

test("+mfa: reports a refresh failure after successful sign-in", async ({
	page,
}) => {
	const address = email.replace("@", `+e2e-${crypto.randomUUID()}.mfa@`);
	// A new MFA requirement prevents refresh after initial sign-in succeeds.
	// Better Auth exposes a generic refresh failure, without the claims challenge.
	await page.goto("/");
	await page.getByRole("button", { name: "Sign in with Microsoft" }).click();
	await page.getByLabel("Email", { exact: true }).fill(address);
	await page.getByLabel("Password", { exact: true }).fill(password);
	await page.getByRole("button", { name: "Log in with password" }).click();
	await page.getByRole("button", { name: "Authorize" }).click();
	await expect(page.getByRole("heading", { name: "Your session" })).toBeVisible(
		{ timeout: 15_000 },
	);
	expect(
		JSON.parse((await page.locator("pre code").textContent()) ?? "").user.email,
	).toBe(address);
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
	await expect(page.getByRole("heading", { name: "Your session" })).toBeVisible(
		{ timeout: 15_000 },
	);
	expect(
		JSON.parse((await page.locator("pre code").textContent()) ?? "").user.email,
	).toBe(address);
});
