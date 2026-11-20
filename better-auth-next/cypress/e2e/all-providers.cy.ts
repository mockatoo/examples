import type { Provider } from "../support/commands";

const providers: Provider[] = [
	"Apple",
	"Google",
	"GitHub",
	"Discord",
	"Facebook",
	"LinkedIn",
	"Microsoft",
	"X",
];

// Every provider shows the same login and consent pages, so one command signs in with all of them.
for (const provider of providers) {
	it(`signs in with ${provider}`, () => {
		cy.mockatooSignIn(provider);
		cy.contains("h1", "Your session").should("be.visible");
	});
}
