import { expect, test } from "@playwright/test";
import { createAddress, logIn } from "../helpers";

test("+blocked: does not create an app session when an admin blocks consent", async ({
	page,
}) => {
	const address = createAddress("blocked");
	// Admin policy stops the user at Google before they can authorize the app.
	await logIn(page, "Google", address);
	await expect(
		page.getByRole("heading", { name: /Access blocked/ }),
	).toBeVisible();
	await expect(page.getByRole("button", { name: "Authorize" })).toBeHidden();
	// Returning to the app still shows sign-in, because no callback succeeded.
	await page.goto("/");
	await expect(
		page.getByRole("button", { name: "Sign in with Google" }),
	).toBeVisible();
	await expect(page.getByText("You are logged in")).toBeHidden();
});
