import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";

/**
 * The signed-in user. Providers with a revocation endpoint also keep the
 * access token, so sign-out can revoke it.
 */
export type Session = {
	email: string;
	provider: string;
	accessToken?: string;
	expires: number;
};

/**
 * The session cookie, encrypted with AES-GCM: the browser can neither read
 * the token nor alter the session.
 */
export function sessions(secret: string) {
	const key = crypto.subtle
		.digest("SHA-256", new TextEncoder().encode(secret))
		.then((raw) =>
			crypto.subtle.importKey("raw", raw, "AES-GCM", false, [
				"encrypt",
				"decrypt",
			]),
		);
	return {
		async set(
			c: Context,
			session: Session,
			options: Parameters<typeof setCookie>[3],
		) {
			const iv = crypto.getRandomValues(new Uint8Array(12));
			const sealed = await crypto.subtle.encrypt(
				{ name: "AES-GCM", iv },
				await key,
				new TextEncoder().encode(JSON.stringify(session)),
			);
			const value = Buffer.concat([iv, new Uint8Array(sealed)]);
			setCookie(c, "session", value.toString("base64url"), options);
		},
		/** The session, or undefined when the cookie is missing, altered or expired. */
		async get(c: Context): Promise<Session | undefined> {
			const value = getCookie(c, "session");
			if (!value) return undefined;
			try {
				const bytes = Buffer.from(value, "base64url");
				const opened = await crypto.subtle.decrypt(
					{ name: "AES-GCM", iv: bytes.subarray(0, 12) },
					await key,
					bytes.subarray(12),
				);
				const session = JSON.parse(new TextDecoder().decode(opened));
				return session.expires > Date.now() && typeof session.email === "string"
					? session
					: undefined;
			} catch {
				return undefined;
			}
		},
	};
}
