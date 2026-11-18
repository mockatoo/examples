import { vitePlugin as remix } from "@remix-run/dev";
import { vercelPreset } from "@vercel/remix/vite";
import { defineConfig } from "vite";

export default defineConfig({
	envPrefix: ["VITE_", "MOCKATOO_FORCE"],
	plugins: [remix({ presets: process.env.VERCEL ? [vercelPreset()] : [] })],
});
