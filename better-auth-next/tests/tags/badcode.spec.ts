import { test } from "@playwright/test";
import { createAddress, signIn, signInError } from "../helpers";

test("+badcode: tells the user to retry when sign-in cannot finish", async ({
	page,
}) => {
	const address = createAddress("badcode");
	// Better Auth reports a rejected authorization code as invalid_code.
	// The app shows a retry message and leaves the user signed out.
	await signIn(page, "Google", address);
	await signInError(
		page,
		"invalid_code",
		"Sign-in failed before it finished. Try again in a minute.",
	);
});
