"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "../lib/auth-client";

export default function SignIn({
	signedIn = false,
	error,
}: {
	signedIn?: boolean;
	error?: string;
}) {
	const router = useRouter();
	const [pending, setPending] = useState(false);
	const [message, setMessage] = useState(
		error ? `Sign-in failed. ${error}` : "",
	);
	async function signIn() {
		setPending(true);
		setMessage("");
		try {
			const result = await authClient.signIn.social({
				provider: "mockatoo",
				callbackURL: "/",
				errorCallbackURL: "/",
			});
			if (result.error)
				setMessage(
					`Sign-in failed. ${result.error.message ?? "Please try again."}`,
				);
		} catch {
			setMessage("Sign-in failed. Please try again.");
		} finally {
			setPending(false);
		}
	}
	async function signOut() {
		setPending(true);
		setMessage("");
		try {
			const result = await authClient.signOut();
			if (result.error) {
				setMessage(
					`Sign-out failed. ${result.error.message ?? "Please try again."}`,
				);
				return;
			}
			router.refresh();
		} catch {
			setMessage("Sign-out failed. Please try again.");
		} finally {
			setPending(false);
		}
	}
	return (
		<div className="actions">
			{signedIn ? (
				<button type="button" onClick={signOut} disabled={pending}>
					{pending ? "Please wait…" : "Sign out"}
				</button>
			) : (
				<button type="button" onClick={signIn} disabled={pending}>
					{pending ? "Please wait…" : "Sign in"}
				</button>
			)}
			{message && <p role="alert">{message}</p>}
		</div>
	);
}
