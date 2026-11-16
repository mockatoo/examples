// Signs in once, then restores the cached cookies before each later test.
beforeEach(() => {
	cy.mockatooSession("Google", "cypress-session");
});

it("starts signed in", () => {
	cy.visit("/");
	cy.contains("h1", "Your session").should("be.visible");
});

it("reuses the same user", () => {
	cy.visit("/");
	cy.sessionUser()
		.its("email")
		.should("match", /\+cypress-session@/);
});
