"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "../lib/auth-client";
import { providers } from "../lib/providers";
import { ProviderLogo } from "./provider-logo";

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
	async function signIn(provider: (typeof providers)[number]["id"]) {
		setPending(true);
		setMessage("");
		try {
			const result = await authClient.signIn.social({
				provider,
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
				<button
					type="button"
					className="secondary"
					onClick={signOut}
					disabled={pending}
				>
					{pending ? "Please wait…" : "Sign out"}
				</button>
			) : (
				<div className="providers">
					{providers.map((provider) => (
						<div className="provider" key={provider.id}>
							<button
								type="button"
								onClick={() => signIn(provider.id)}
								disabled={pending}
							>
								<ProviderLogo
									id={
										provider.id === "microsoft"
											? "microsoft-entra-id"
											: provider.id === "twitter"
												? "twitter"
												: provider.id
									}
								/>
								{pending ? "Please wait…" : `Sign in with ${provider.name}`}
							</button>
						</div>
					))}
				</div>
			)}
			{message && <p role="alert">{message}</p>}
		</div>
	);
}
