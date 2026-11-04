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
import { env } from "$env/dynamic/private";
import { MOCKATOO_URL } from "$env/static/private";

if (!env.BETTER_AUTH_SECRET) {
	throw new Error(
		"BETTER_AUTH_SECRET is required. Set it in .env.local or your deployment environment.",
	);
}

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
	socialProviders: MOCKATOO_URL
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
	plugins: MOCKATOO_URL
		? [
				mockApple({ origin: MOCKATOO_URL }),
				mockGoogle({ origin: MOCKATOO_URL }),
				mockGitHub({ origin: MOCKATOO_URL }),
				mockDiscord({ origin: MOCKATOO_URL }),
				mockFacebook({ origin: MOCKATOO_URL }),
				mockLinkedIn({ origin: MOCKATOO_URL }),
				mockMicrosoft({ origin: MOCKATOO_URL }),
				mockTwitter({ origin: MOCKATOO_URL }),
			]
		: [],
});
