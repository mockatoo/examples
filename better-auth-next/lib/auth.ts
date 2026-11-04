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

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
	throw new Error(
		"BETTER_AUTH_SECRET is required. Set it in .env.local or your deployment environment.",
	);
}

const mockOrigin = process.env.MOCKATOO_URL;

export const auth = betterAuth({
	baseURL: { allowedHosts: ["localhost:*", "*.vercel.app"] },
	secret,
	socialProviders: mockOrigin
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
	plugins: mockOrigin
		? [
				mockApple({ origin: mockOrigin }),
				mockGoogle({ origin: mockOrigin }),
				mockGitHub({ origin: mockOrigin }),
				mockDiscord({ origin: mockOrigin }),
				mockFacebook({ origin: mockOrigin }),
				mockLinkedIn({ origin: mockOrigin }),
				mockMicrosoft({ origin: mockOrigin }),
				mockTwitter({ origin: mockOrigin }),
			]
		: [],
});
