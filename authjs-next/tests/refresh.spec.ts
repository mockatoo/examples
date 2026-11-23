import { expect, test } from "@playwright/test";

const email = process.env.MOCKATOO_TEST_EMAIL ?? "";
const password = process.env.MOCKATOO_TEST_PASSWORD ?? "";

test("refreshes the Microsoft access token", async ({ page }) => {
	const address = email.replace("@", `+e2e-${crypto.randomUUID()}@`);
	// Without a tag the refresh succeeds, so the tag specs' RefreshTokenError
	// comes from Microsoft's answer and not from the example's code.
	await page.goto("/");
	await page.getByRole("button", { name: "Sign in with Microsoft" }).click();
	await page.getByLabel("Email", { exact: true }).fill(address);
	await page.getByLabel("Password", { exact: true }).fill(password);
	await page.getByRole("button", { name: "Log in with password" }).click();
	await page.getByRole("button", { name: "Authorize" }).click();
	await expect(page.getByRole("heading", { name: "Your session" })).toBeVisible(
		{ timeout: 15_000 },
	);
	const { csrfToken } = await (await page.request.get("/api/auth/csrf")).json();
	const response = await page.request.post("/api/auth/session", {
		data: { csrfToken, data: { refresh: true } },
	});
	expect(response.status()).toBe(200);
	const session = await response.json();
	expect(session.user.email).toBe(address);
	expect(session.error).toBeUndefined();
});
