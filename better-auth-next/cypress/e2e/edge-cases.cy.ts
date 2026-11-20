it("signs in as a tagged address", () => {
	cy.mockatooSignIn("Google", { tag: "cypress-1" }).then((address) => {
		cy.sessionUser().its("email").should("equal", address);
	});
});

it("+unverified: keeps an unverified email unverified", () => {
	cy.mockatooSignIn("Google", { tag: "unverified" }).then((address) => {
		cy.sessionUser().should("include", {
			email: address,
			emailVerified: false,
		});
	});
});

it("+down: shows a retry message when the token endpoint is down", () => {
	cy.mockatooSignIn("Google", { tag: "down" });
	cy.location("search").should("contain", "error=invalid_code");
	cy.contains(
		"[role=alert]",
		"Sign-in failed before it finished. Try again in a minute.",
	);
});

it("Deny: returns access_denied to the app", () => {
	cy.mockatooSignIn("Google", { consent: "Deny" });
	cy.location("search").should("contain", "error=access_denied");
	cy.contains("[role=alert]", "Sign-in failed because you cancelled it.");
});
