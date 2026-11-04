import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { loadEnv } from "vite";

const { MOCKATOO_URL } = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");

export default {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({ runtime: "nodejs24.x" }),
		// Apple returns to /api/auth/callback/apple with a cross-site form POST
		// (response_mode=form_post), which SvelteKit's CSRF check rejects by default.
		csrf: {
			trustedOrigins: [MOCKATOO_URL ? new URL(MOCKATOO_URL).origin : "https://appleid.apple.com"],
		},
	},
};
