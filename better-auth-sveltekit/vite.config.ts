import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const { MOCKATOO_FORCE } = loadEnv(mode, process.cwd(), "");
	return {
		define: {
			__MOCKATOO_FORCE__: JSON.stringify(MOCKATOO_FORCE === "true"),
		},
		plugins: [sveltekit()],
	};
});
