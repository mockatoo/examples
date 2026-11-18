import type { Session } from "@auth/core/types";
import { MOCKATOO_URL } from "@mockatoo/connect-authjs";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, url }) => {
	const response = await fetch("/auth/session");
	if (!response.ok) throw new Error("Could not read the Auth.js session");
	const session: Session | null = await response.json();

	return {
		mockatooUrl: MOCKATOO_URL,
		session,
		error: url.searchParams.has("error"),
	};
};
