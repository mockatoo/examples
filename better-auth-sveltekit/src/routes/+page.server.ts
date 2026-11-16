import { MOCKATOO_URL } from "@mockatoo/connect-better-auth";
import { auth } from "../lib/auth";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ request, url }) => ({
	mockatooUrl: MOCKATOO_URL,
	session: await auth.api.getSession({ headers: request.headers }),
	error: url.searchParams.get("error"),
});
