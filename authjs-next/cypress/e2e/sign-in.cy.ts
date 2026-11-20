/// <reference types="cypress" />

const mockatooUrl: string = Cypress.expose("mockatooUrl");

type Credentials = {
	MOCKATOO_TEST_EMAIL?: string;
	MOCKATOO_TEST_PASSWORD?: string;
};

for (const decision of ["Authorize", "Deny"]) {
	it(`Google sign-in: ${decision}`, () => {
		cy.env<Credentials>(["MOCKATOO_TEST_EMAIL", "MOCKATOO_TEST_PASSWORD"]).then(
			({ MOCKATOO_TEST_EMAIL: email, MOCKATOO_TEST_PASSWORD: password }) => {
				if (!email || !password) {
					throw new Error(
						"Set MOCKATOO_TEST_EMAIL and MOCKATOO_TEST_PASSWORD in .env.local or the environment.",
					);
				}

				cy.visit("/");
				cy.contains("button", "Sign in with Google").click();
				cy.origin(
					mockatooUrl,
					{ args: { email, password, decision } },
					({ email, password, decision }) => {
						cy.get("#email").type(email, {
							log: false,
							parseSpecialCharSequences: false,
						});
						cy.get("#password").type(password, {
							log: false,
							parseSpecialCharSequences: false,
						});
						cy.contains("button", "Log in with password").click();
						cy.contains("button", decision).click();
					},
				);

				if (decision === "Deny") {
					cy.get('[role="alert"]').should("contain.text", "Sign-in failed");
					return;
				}
				cy.get("pre code").should("contain.text", email);
				cy.contains("button", "Sign out").click();
				cy.contains("button", "Sign in with Google").should("be.visible");
			},
		);
	});
}
