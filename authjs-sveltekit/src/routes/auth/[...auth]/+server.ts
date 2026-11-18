import { Auth } from "@auth/core";
import { authConfig } from "#lib/auth.server.ts";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ request }) => Auth(request, authConfig());
export const POST = GET;
