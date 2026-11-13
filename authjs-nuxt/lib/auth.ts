import type { AuthConfig } from "@auth/core";
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
import Apple from "next-auth/providers/apple";
import Discord from "next-auth/providers/discord";
import Facebook from "next-auth/providers/facebook";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Twitter from "next-auth/providers/twitter";
import { providers } from "./providers";

// Your app would switch on NODE_ENV, so production uses the real providers:
//   const useMock = process.env.NODE_ENV !== "production";
// This demo also runs the mock in production on Vercel, where NODE_ENV is
// always "production", so its committed .env sets MOCKATOO_FORCE=true.
// Delete that line from .env before you ship.
export function authConfig(useMock: boolean, origin?: string): AuthConfig {
	const options = (index: number) => ({
		authorization: { params: { scope: providers[index].scope } },
	});
	const microsoft = {
		...options(6),
		profile: (profile: { sub: string; name?: string; email?: string }) => ({
			id: profile.sub,
			name: profile.name,
			email: profile.email,
			image: null,
		}),
	};
	return {
		secret: process.env.AUTH_SECRET,
		basePath: "/api/auth",
		trustHost: true,
		pages: { signIn: "/", error: "/" },
		providers: useMock
			? [
					MockApple({ origin, ...options(0) }),
					MockGoogle({ origin, ...options(1) }),
					MockGitHub({ origin, ...options(2) }),
					MockDiscord({ origin, issuer: "https://discord.com", ...options(3) }),
					MockFacebook({ origin, ...options(4) }),
					MockLinkedIn({ origin, ...options(5) }),
					MockMicrosoftEntraID({ origin, ...microsoft }),
					MockTwitter({ origin, ...options(7) }),
				]
			: [
					Apple({
						clientId: process.env.AUTH_APPLE_ID,
						clientSecret: process.env.AUTH_APPLE_SECRET,
						...options(0),
					}),
					Google({
						clientId: process.env.AUTH_GOOGLE_ID,
						clientSecret: process.env.AUTH_GOOGLE_SECRET,
						...options(1),
					}),
					GitHub({
						clientId: process.env.AUTH_GITHUB_ID,
						clientSecret: process.env.AUTH_GITHUB_SECRET,
						...options(2),
					}),
					Discord({
						clientId: process.env.AUTH_DISCORD_ID,
						clientSecret: process.env.AUTH_DISCORD_SECRET,
						issuer: "https://discord.com",
						...options(3),
					}),
					Facebook({
						clientId: process.env.AUTH_FACEBOOK_ID,
						clientSecret: process.env.AUTH_FACEBOOK_SECRET,
						...options(4),
					}),
					LinkedIn({
						clientId: process.env.AUTH_LINKEDIN_ID,
						clientSecret: process.env.AUTH_LINKEDIN_SECRET,
						...options(5),
					}),
					MicrosoftEntraID({
						clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
						clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
						...microsoft,
					}),
					Twitter({
						clientId: process.env.AUTH_TWITTER_ID,
						clientSecret: process.env.AUTH_TWITTER_SECRET,
						authorization: {
							url: "https://x.com/i/oauth2/authorize",
							params: { scope: providers[7].scope },
						},
					}),
				],
	};
}
