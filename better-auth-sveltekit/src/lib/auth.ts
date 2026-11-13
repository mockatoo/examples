import {
	mockApple,
	mockDiscord,
	mockFacebook,
	mockGitHub,
	mockGoogle,
	mockLinkedIn,
	mockMicrosoft,
	mockTwitter,
} from "@mockatoo/connect-better-auth";
import { betterAuth } from "better-auth";
import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";

if (!env.BETTER_AUTH_SECRET) {
	throw new Error(
		"BETTER_AUTH_SECRET is required. Set it in .env.local or your deployment environment.",
	);
}

// Your app would switch on dev, so production uses the real providers:
//   const useMock = dev;   // import { dev } from "$app/environment";
// This demo also runs the mock in production on Vercel, where dev is
// always false, so its committed .env sets MOCKATOO_FORCE=true.
// Delete that line from .env before you ship.
const useMock = dev || __MOCKATOO_FORCE__;
// Optional origin override for Mockatoo's own tests; unset uses the hosted service.
const origin = env.MOCKATOO_URL || undefined;

export const auth = betterAuth({
	baseURL: { allowedHosts: ["localhost:*", "*.vercel.app"] },
	secret: env.BETTER_AUTH_SECRET,
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: [
				"apple",
				"google",
				"github",
				"discord",
				"facebook",
				"linkedin",
				"microsoft",
				"twitter",
			],
		},
	},
	rateLimit: { customRules: { "/sign-in/social": { window: 10, max: 30 } } },
	socialProviders: useMock
		? {}
		: {
				apple: {
					clientId: process.env.APPLE_CLIENT_ID ?? "",
					clientSecret: process.env.APPLE_CLIENT_SECRET ?? "",
				},
				google: {
					clientId: process.env.GOOGLE_CLIENT_ID ?? "",
					clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
					accessType: "offline",
				},
				github: {
					clientId: process.env.GITHUB_CLIENT_ID ?? "",
					clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
				},
				discord: {
					clientId: process.env.DISCORD_CLIENT_ID ?? "",
					clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
				},
				facebook: {
					clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
					clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
				},
				linkedin: {
					clientId: process.env.LINKEDIN_CLIENT_ID ?? "",
					clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
				},
				microsoft: {
					clientId: process.env.MICROSOFT_CLIENT_ID ?? "",
					clientSecret: process.env.MICROSOFT_CLIENT_SECRET ?? "",
					tenantId: "common",
				},
				twitter: {
					clientId: process.env.TWITTER_CLIENT_ID ?? "",
					clientSecret: process.env.TWITTER_CLIENT_SECRET ?? "",
				},
			},
	plugins: useMock
		? [
				mockApple({ origin }),
				mockGoogle({ origin }),
				mockGitHub({ origin }),
				mockDiscord({ origin }),
				mockFacebook({ origin }),
				mockLinkedIn({ origin }),
				mockMicrosoft({ origin }),
				mockTwitter({ origin }),
			]
		: [],
});
