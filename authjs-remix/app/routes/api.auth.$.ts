import { Auth } from "@auth/core";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authConfig } from "../auth.server";

export function loader({ request }: LoaderFunctionArgs) {
	return Auth(request, authConfig());
}

export function action({ request }: ActionFunctionArgs) {
	return Auth(request, authConfig());
}
