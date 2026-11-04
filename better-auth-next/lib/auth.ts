import { createMockatooPlugin } from "@mockatoo/connect-better-auth";
import { betterAuth } from "better-auth";

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
	throw new Error(
		"BETTER_AUTH_SECRET is required. Set it in .env.local or your deployment environment.",
	);
}

const origin = process.env.MOCKATOO_URL;

export const auth = betterAuth({
	baseURL: { allowedHosts: ["localhost:*", "*.vercel.app"] },
	secret,
	plugins: origin ? [createMockatooPlugin({ origin })] : [],
});
