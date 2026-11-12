import { test } from "@playwright/test";
import { createAddress, signIn, signInError } from "../helpers";

test("+down: tells the user to retry when sign-in cannot finish", async ({
	page,
}) => {
	const address = createAddress("down");
	// A provider outage also becomes invalid_code in Better Auth. The app
	// cannot distinguish it from a bad code, so it offers the same retry advice.
	await signIn(page, "Google", address);
	await signInError(
		page,
		"invalid_code",
		"Sign-in failed before it finished. Try again in a minute.",
	);
});
