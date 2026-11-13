type Credentials = { MOCKATOO_TEST_EMAIL?: string; MOCKATOO_TEST_PASSWORD?: string };
const credentialKeys = ["MOCKATOO_TEST_EMAIL", "MOCKATOO_TEST_PASSWORD"];

beforeEach(() => {
	cy.env<Credentials>(credentialKeys).then(({ MOCKATOO_TEST_EMAIL, MOCKATOO_TEST_PASSWORD }) => {
		if (!MOCKATOO_TEST_EMAIL || !MOCKATOO_TEST_PASSWORD)
			throw new Error("Set CYPRESS_MOCKATOO_TEST_EMAIL and CYPRESS_MOCKATOO_TEST_PASSWORD.");
	});
});

it("signs in with Google", () => {
	cy.visit("/");
	cy.contains("button", "Sign in with Google").click();
	cy.env<Credentials>(credentialKeys).then(({ MOCKATOO_TEST_EMAIL, MOCKATOO_TEST_PASSWORD }) => {
		const email = MOCKATOO_TEST_EMAIL as string;
		const password = MOCKATOO_TEST_PASSWORD as string;
		cy.origin(
			Cypress.expose("MOCKATOO_URL"),
			{ args: { email, password } },
			({ email, password }) => {
				cy.get("#email").type(email);
				cy.get("#password").type(`${password}{enter}`, { log: false });
				cy.contains("button", "Authorize").click();
			},
		);
	});
	cy.contains("h1", "Your session").should("be.visible");
});
