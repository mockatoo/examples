import type { AuthConfig } from "@auth/core";
import Apple from "@auth/core/providers/apple";
import Discord from "@auth/core/providers/discord";
import Facebook from "@auth/core/providers/facebook";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import LinkedIn from "@auth/core/providers/linkedin";
import MicrosoftEntraID from "@auth/core/providers/microsoft-entra-id";
import Twitter from "@auth/core/providers/twitter";
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
import { json } from "@remix-run/node";
import { providers } from "./providers";

const secret = process.env.AUTH_SECRET;
if (!secret) throw new Error("Set AUTH_SECRET before starting the app.");

// Your app would switch on NODE_ENV, so production uses the real providers:
//   const useMock = process.env.NODE_ENV !== "production";
// This demo also runs the mock in production on Vercel, where NODE_ENV is
// always "production", so its committed .env sets MOCKATOO_FORCE=true.
// Delete that line from .env before you ship.
const useMock =
	import.meta.env.DEV || import.meta.env.MOCKATOO_FORCE === "true";

// The connector reads the optional MOCKATOO_URL override from the server environment.
export function authConfig(): AuthConfig {
	// Remix 2's Node adapter can install a Response implementation without this
	// static method, which Auth.js uses when handling provider discovery.
	Response.json ??= json;

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
		secret,
		basePath: "/api/auth",
		trustHost: true,
		pages: { signIn: "/", error: "/" },
		providers: useMock
			? [
					MockApple({ ...options(0) }),
					MockGoogle({ ...options(1) }),
					MockGitHub({ ...options(2) }),
					MockDiscord({ issuer: "https://discord.com", ...options(3) }),
					MockFacebook({ ...options(4) }),
					MockLinkedIn({ ...options(5) }),
					MockMicrosoftEntraID(microsoft),
					MockTwitter({ ...options(7) }),
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
