import { loadEnvFile } from "node:process";

loadEnvFile(new URL("../.env", import.meta.url));
try {
	loadEnvFile(new URL("../.env.local", import.meta.url));
} catch (error) {
	if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}
