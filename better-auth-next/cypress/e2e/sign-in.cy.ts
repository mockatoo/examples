const mockatooUrl: string = Cypress.expose("mockatooUrl");

type Credentials = {
	MOCKATOO_TEST_EMAIL?: string;
	MOCKATOO_TEST_PASSWORD?: string;
};
const credentialKeys = ["MOCKATOO_TEST_EMAIL", "MOCKATOO_TEST_PASSWORD"];

beforeEach(() => {
	cy.env<Credentials>(credentialKeys).then(
		({ MOCKATOO_TEST_EMAIL, MOCKATOO_TEST_PASSWORD }) => {
			if (!MOCKATOO_TEST_EMAIL || !MOCKATOO_TEST_PASSWORD)
				throw new Error(
					"Set MOCKATOO_TEST_EMAIL and MOCKATOO_TEST_PASSWORD in .env.local or the environment.",
				);
		},
	);
});

it("signs in with Google", () => {
	cy.visit("/");
	cy.contains("button", "Sign in with Google").click();
	cy.env<Credentials>(credentialKeys).then(
		({ MOCKATOO_TEST_EMAIL, MOCKATOO_TEST_PASSWORD }) => {
			const email = MOCKATOO_TEST_EMAIL as string;
			const password = MOCKATOO_TEST_PASSWORD as string;
			cy.origin(
				mockatooUrl,
				{ args: { email, password } },
				({ email, password }) => {
					cy.get("#email").type(email, {
						log: false,
						parseSpecialCharSequences: false,
					});
					cy.get("#password").type(password, {
						log: false,
						parseSpecialCharSequences: false,
					});
					cy.contains("button", "Log in with password").click();
					cy.contains("button", "Authorize").click();
				},
			);
		},
	);
	cy.contains("h1", "Your session").should("be.visible");
});
