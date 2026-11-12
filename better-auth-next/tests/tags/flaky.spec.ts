import { test } from "@playwright/test";
import { createAddress, signIn, signInError } from "../helpers";

test("+flaky: tells the user to retry when sign-in cannot finish", async ({
	page,
}) => {
	const address = createAddress("flaky");
	// Better Auth does not retry a failed code exchange. Even though a retry
	// could succeed, the app sees invalid_code and asks the user to try again.
	await signIn(page, "Google", address);
	await signInError(
		page,
		"invalid_code",
		"Sign-in failed before it finished. Try again in a minute.",
	);
});
