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

const origin = process.env.MOCKATOO_URL;
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
export const { handlers, auth, signIn, signOut } = NextAuth({
	trustHost: true,
	pages: { signIn: "/", error: "/" },
	providers: origin
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
				Apple(options(0)),
				Google(options(1)),
				GitHub(options(2)),
				Discord({ issuer: "https://discord.com", ...options(3) }),
				Facebook(options(4)),
				LinkedIn(options(5)),
				MicrosoftEntraID(microsoft),
				Twitter({
					authorization: {
						url: "https://x.com/i/oauth2/authorize",
						params: { scope: providers[7].scope },
					},
				}),
			],
});
