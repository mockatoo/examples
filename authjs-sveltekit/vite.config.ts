import { MOCKATOO_URL } from "@mockatoo/connect-authjs";
import adapter from "@sveltejs/adapter-vercel";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const useMock = loadEnv(mode, process.cwd(), "").MOCKATOO_FORCE === "true";

	return {
		define: { __MOCKATOO_FORCE__: JSON.stringify(useMock) },
		plugins: [
			sveltekit({
				preprocess: vitePreprocess(),
				adapter: adapter({ runtime: "nodejs24.x" }),
				// Apple's callback is a cross-site form POST.
				csrf: {
					trustedOrigins: [
						useMock || mode === "development"
							? new URL(MOCKATOO_URL).origin
							: "https://appleid.apple.com",
					],
				},
			}),
			process.env.HTTPS === "true" && basicSsl(),
		],
	};
});
