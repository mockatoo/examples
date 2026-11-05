type Credentials = { MOCK_EMAIL?: string; MOCK_PASSWORD?: string };
const credentialKeys = ["MOCK_EMAIL", "MOCK_PASSWORD"];

beforeEach(() => {
	cy.env<Credentials>(credentialKeys).then(({ MOCK_EMAIL, MOCK_PASSWORD }) => {
		if (!MOCK_EMAIL || !MOCK_PASSWORD)
			throw new Error("Set CYPRESS_MOCK_EMAIL and CYPRESS_MOCK_PASSWORD.");
	});
});

it("signs in with Google", () => {
	cy.visit("/");
	cy.contains("button", "Sign in with Google").click();
	cy.env<Credentials>(credentialKeys).then(({ MOCK_EMAIL, MOCK_PASSWORD }) => {
		const email = MOCK_EMAIL as string;
		const password = MOCK_PASSWORD as string;
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
