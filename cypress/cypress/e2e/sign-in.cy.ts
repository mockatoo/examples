let email = "";
let password = "";

beforeEach(() => {
	cy.env<{ MOCK_EMAIL?: string; MOCK_PASSWORD?: string }>([
		"MOCK_EMAIL",
		"MOCK_PASSWORD",
	]).then(({ MOCK_EMAIL, MOCK_PASSWORD }) => {
		email = MOCK_EMAIL ?? "";
		password = MOCK_PASSWORD ?? "";
		if (!email || !password)
			throw new Error("Set CYPRESS_MOCK_EMAIL and CYPRESS_MOCK_PASSWORD.");
	});
});

it("signs in with Google", () => {
	cy.visit("/");
	cy.contains("button", "Sign in with Google").click();
	cy.origin(
		Cypress.expose("MOCKATOO_URL"),
		{ args: { email, password } },
		({ email, password }) => {
			cy.get("#email").type(email);
			cy.get("#password").type(password, { log: false });
			cy.contains("button", "Log in with password").click();
			cy.contains("button", "Authorize").click();
		},
	);
	cy.contains("h1", "Your session").should("be.visible");
});
