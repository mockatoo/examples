import { Auth } from "@auth/core";
import { authConfig } from "../../../lib/auth";

export default defineEventHandler(async (event) => {
	const response = await Auth(
		toWebRequest(event),
		authConfig(useRuntimeConfig(event).mockatooUrl),
	);
	return sendWebResponse(event, response);
});
