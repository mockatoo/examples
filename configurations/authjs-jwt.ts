/**
 * An Auth.js (NextAuth v5) app with its defaults: JWT sessions in a cookie
 * and no database. Each provider is the one from `next-auth/providers`;
 * outside production the app swaps in the mock connector of the same name.
 */
import type { AuthConfig } from "@auth/core";
import {
	MockApple,
	MockGitHub,
	MockGoogle,
	MockMicrosoftEntraID,
} from "@mockatoo/connect-authjs";
import Apple from "next-auth/providers/apple";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export function createAuthJsJwtConfig({
	mock,
	microsoftIssuer = process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
}: {
	mock?: boolean;
	/** The Entra issuer, which names the app's tenant (`common` by default). */
	microsoftIssuer?: string;
}): AuthConfig {
	return {
		secret: "authjs-secret-at-least-thirty-two-characters",
		trustHost: true,
		basePath: "/api/auth",
		providers: mock
			? [
					MockGoogle(),
					MockGitHub(),
					MockMicrosoftEntraID({ issuer: microsoftIssuer }),
					MockApple(),
					// Lets developers and agents sign in with any Mockatoo account.
				]
			: [Google, GitHub, MicrosoftEntraID({ issuer: microsoftIssuer }), Apple],
	};
}
