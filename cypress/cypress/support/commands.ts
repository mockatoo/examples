import { MOCKATOO_URL } from "@mockatoo/connect-better-auth";
export type Provider =
	| "Apple"
	| "Google"
	| "GitHub"
	| "Discord"
	| "Facebook"
	| "LinkedIn"
	| "Microsoft"
	| "X";

export type SignInOptions = {
	/** Signs in as `you+<tag>@…`: a separate user with the same password. */
	tag?: string;
	/** The consent button to click. */
	consent?: "Authorize" | "Deny";
};

export type SessionUser = {
	id: string;
	email: string;
	emailVerified: boolean;
	name: string;
};

declare global {
	namespace Cypress {
		interface Chainable {
			/** Signs in through Mockatoo and yields the address it used. */
			mockatooSignIn(
				provider: Provider,
				options?: SignInOptions,
			): Chainable<string>;
			/** Signs in once per provider and tag, then restores the cached session. */
			mockatooSession(provider: Provider, tag?: string): Chainable<void>;
			/** Yields the user from the session the app displays. */
			sessionUser(): Chainable<SessionUser>;
		}
	}
}

type Credentials = {
	MOCKATOO_TEST_EMAIL?: string;
	MOCKATOO_TEST_PASSWORD?: string;
};
const credentialKeys = ["MOCKATOO_TEST_EMAIL", "MOCKATOO_TEST_PASSWORD"];

Cypress.Commands.add(
	"mockatooSignIn",
	(provider: Provider, { tag, consent = "Authorize" }: SignInOptions = {}) =>
		cy
			.env<Credentials>(credentialKeys)
			.then(
				({ MOCKATOO_TEST_EMAIL: email, MOCKATOO_TEST_PASSWORD: password }) => {
					if (!email || !password)
						throw new Error(
							"Set CYPRESS_MOCKATOO_TEST_EMAIL and CYPRESS_MOCKATOO_TEST_PASSWORD.",
						);
					const address = tag ? email.replace("@", `+${tag}@`) : email;
					cy.visit("/");
					cy.contains("button", `Sign in with ${provider}`).click();
					cy.origin(
						MOCKATOO_URL,
						{ args: { address, password, consent } },
						({ address, password, consent }) => {
							cy.get("#email").type(address);
							cy.get("#password").type(password, { log: false });
							cy.contains("button", "Log in with password").click();
							cy.contains("button", consent).click();
						},
					);
					return cy.wrap(address, { log: false });
				},
			),
);

Cypress.Commands.add("mockatooSession", (provider: Provider, tag?: string) => {
	cy.session(
		[provider, tag],
		() => {
			cy.mockatooSignIn(provider, { tag });
			cy.contains("h1", "Your session").should("be.visible");
		},
		{
			validate() {
				cy.request("/api/auth/get-session").its("body").should("not.be.null");
			},
		},
	);
});

Cypress.Commands.add("sessionUser", () =>
	cy
		.contains("h1", "Your session")
		.should("be.visible")
		.get("pre code")
		.invoke("text")
		.then((text) => JSON.parse(text).user as SessionUser),
);
