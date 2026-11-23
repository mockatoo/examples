import {
	MockApple,
	MockDiscord,
	MockFacebook,
	MockGitHub,
	MockGoogle,
	MockLinkedIn,
	MockMicrosoftEntraID,
	MockTwitter,
} from "@mockatoo/connect-authjs";
import NextAuth from "next-auth";
import Apple from "next-auth/providers/apple";
import Discord from "next-auth/providers/discord";
import Facebook from "next-auth/providers/facebook";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Twitter from "next-auth/providers/twitter";
import { providers } from "./providers";

if (!process.env.AUTH_SECRET) {
	throw new Error(
		"AUTH_SECRET is required. Set it in .env.local or your deployment environment.",
	);
}

declare module "next-auth" {
	interface Session {
		error?: "RefreshTokenError";
	}
}

/** What the `jwt` callback keeps in the session cookie for Microsoft. */
type Tokens = {
	access_token?: string;
	expires_at?: number;
	refresh_token?: string;
	error?: "RefreshTokenError";
};

// Your app would switch on NODE_ENV, so production uses the real providers:
//   const useMock = process.env.NODE_ENV !== "production";
// This demo also runs the mock in production on Vercel, where NODE_ENV is
// always "production", so its committed .env sets MOCKATOO_FORCE=true.
// Delete that line from .env before you ship.
const useMock =
	process.env.NODE_ENV !== "production" ||
	process.env.MOCKATOO_FORCE === "true";
const options = (index: number) => ({
	authorization: { params: { scope: providers[index].scope } },
});
const microsoftOptions = {
	...options(6),
	profile: (profile: { sub: string; name?: string; email?: string }) => ({
		id: profile.sub,
		name: profile.name,
		email: profile.email,
		image: null,
	}),
};
const microsoft = useMock
	? MockMicrosoftEntraID(microsoftOptions)
	: MicrosoftEntraID(microsoftOptions);

// Auth.js refreshes nothing by itself. This is its refresh token rotation
// guide for Microsoft, which returns a refresh token for `offline_access`.
async function refreshMicrosoftToken(refreshToken: string) {
	// The provider keeps its settings in `options`. Without a mock they come
	// from the AUTH_MICROSOFT_ENTRA_ID_* variables.
	const {
		issuer = "",
		clientId = process.env.AUTH_MICROSOFT_ENTRA_ID_ID ?? "",
		clientSecret = process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET ?? "",
	} = microsoft.options ?? {};
	const discovery = await fetch(`${issuer}/.well-known/openid-configuration`);
	const { token_endpoint } = (await discovery.json()) as {
		token_endpoint: string;
	};
	const response = await fetch(token_endpoint, {
		method: "POST",
		body: new URLSearchParams({
			client_id: clientId,
			client_secret: clientSecret,
			grant_type: "refresh_token",
			refresh_token: refreshToken,
		}),
	});
	const tokens = (await response.json()) as {
		access_token: string;
		expires_in: number;
		refresh_token?: string;
	};
	if (!response.ok) throw tokens;
	return tokens;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	trustHost: true,
	pages: { signIn: "/", error: "/" },
	session: { strategy: "jwt" },
	providers: useMock
		? [
				MockApple({ ...options(0) }),
				MockGoogle({ ...options(1) }),
				MockGitHub({ ...options(2) }),
				MockDiscord({ issuer: "https://discord.com", ...options(3) }),
				MockFacebook({ ...options(4) }),
				MockLinkedIn({ ...options(5) }),
				microsoft,
				MockTwitter({ ...options(7) }),
			]
		: [
				Apple(options(0)),
				Google(options(1)),
				GitHub(options(2)),
				Discord({ issuer: "https://discord.com", ...options(3) }),
				Facebook(options(4)),
				LinkedIn(options(5)),
				microsoft,
				Twitter({
					authorization: {
						url: "https://x.com/i/oauth2/authorize",
						params: { scope: providers[7].scope },
					},
				}),
			],
	callbacks: {
		// Refuse addresses the provider hasn't verified. Apple sends the claim
		// as a string.
		signIn({ profile }) {
			const verified: unknown = profile?.email_verified;
			return verified !== false && verified !== "false";
		},
		async jwt({ token: jwt, account, trigger, session }) {
			const token: typeof jwt & Tokens = jwt;
			if (account?.provider === "microsoft-entra-id") {
				return {
					...token,
					access_token: account.access_token,
					expires_at: account.expires_at,
					refresh_token: account.refresh_token,
				};
			}
			if (!token.refresh_token) return token;
			// `update({ refresh: true })` refreshes before expiry, as a test would.
			const forced = trigger === "update" && session?.refresh === true;
			if (!forced && Date.now() < (token.expires_at ?? 0) * 1000) return token;
			try {
				const tokens = await refreshMicrosoftToken(token.refresh_token);
				return {
					...token,
					access_token: tokens.access_token,
					expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
					refresh_token: tokens.refresh_token ?? token.refresh_token,
					error: undefined,
				};
			} catch (error) {
				console.error("Error refreshing access_token", error);
				return { ...token, error: "RefreshTokenError" };
			}
		},
		session({ session, token }) {
			const { error } = token as Tokens;
			if (error) session.error = error;
			return session;
		},
	},
});
