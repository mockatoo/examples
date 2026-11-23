import { expect, test } from "@playwright/test";

const email = process.env.MOCKATOO_TEST_EMAIL ?? "";
const password = process.env.MOCKATOO_TEST_PASSWORD ?? "";

test("+revoked: marks the session when refresh fails", async ({ page }) => {
	const address = email.replace("@", `+e2e-${crypto.randomUUID()}.revoked@`);
	// Revoked access affects refresh, not sign-in.
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
	// Ask Auth.js to update the session, as useSession().update() does. The
	// example's jwt callback refreshes the Microsoft token when asked.
	const { csrfToken } = await (await page.request.get("/api/auth/csrf")).json();
	const response = await page.request.post("/api/auth/session", {
		data: { csrfToken, data: { refresh: true } },
	});
	expect(response.status()).toBe(200);
	expect(await response.json()).toMatchObject({
		error: "RefreshTokenError",
		user: { email: address },
	});
	// The cookie session survives; the page asks the user to reconnect.
	await page.reload();
	await expect(
		page.getByRole("alert").filter({ hasText: "Microsoft access expired" }),
	).toHaveText(
		"Microsoft access expired. Sign in with Microsoft again to reconnect.",
	);
	expect(
		JSON.parse((await page.locator("pre code").textContent()) ?? "").user.email,
	).toBe(address);
});
