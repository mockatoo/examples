import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
	BETTER_AUTH_SECRET: { schema: (value) => value },
});
