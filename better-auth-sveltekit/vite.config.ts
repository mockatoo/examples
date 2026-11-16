import adapter from "@sveltejs/adapter-vercel";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const { MOCKATOO_FORCE, MOCKATOO_URL } = loadEnv(mode, process.cwd(), "");
	return {
		define: {
			__MOCKATOO_FORCE__: JSON.stringify(MOCKATOO_FORCE === "true"),
		},
		plugins: [
			sveltekit({
				preprocess: vitePreprocess(),
				adapter: adapter({ runtime: "nodejs24.x" }),
				// Apple sends its OAuth callback as a cross-site form POST.
				csrf: {
					trustedOrigins: [
						MOCKATOO_FORCE === "true"
							? new URL(
									MOCKATOO_URL || "https://app.mockatoo.globalunderdog.com",
								).origin
							: "https://appleid.apple.com",
					],
				},
			}),
		],
	};
});
