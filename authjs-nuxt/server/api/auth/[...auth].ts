import { Auth } from "@auth/core";
import { authConfig } from "../../../lib/auth";

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig(event);
	const response = await Auth(
		toWebRequest(event),
		authConfig(
			config.mockatooForce || process.env.NODE_ENV !== "production",
			config.mockatooUrl || undefined,
		),
	);
	return sendWebResponse(event, response);
});
