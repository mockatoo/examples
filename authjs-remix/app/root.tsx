import { Auth } from "@auth/core";
import type { Session } from "@auth/core/types";
import { MOCKATOO_URL } from "@mockatoo/connect-authjs";
import {
	type HeadersFunction,
	json,
	type LoaderFunctionArgs,
} from "@remix-run/node";
import {
	Links,
	Meta,
	Scripts,
	useLoaderData,
	useSearchParams,
} from "@remix-run/react";
import { type ReactNode, useEffect, useState } from "react";
import { authConfig } from "./auth.server";
import { ProviderLogo } from "./provider-logo";
import { providers } from "./providers";

import "./style.css";

export function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Auth.js + Remix | Mockatoo</title>
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}

export const headers: HeadersFunction = () => ({
	"Cache-Control": "private, no-store",
});

export async function loader({ request }: LoaderFunctionArgs) {
	const config = authConfig();
	const [sessionResponse, csrfResponse] = await Promise.all(
		["session", "csrf"].map((action) =>
			Auth(
				new Request(new URL(`/api/auth/${action}`, request.url), {
					headers: request.headers,
				}),
				config,
			),
		),
	);
	if (!sessionResponse.ok) throw sessionResponse;
	if (!csrfResponse.ok) throw csrfResponse;

	const session: Session | null = await sessionResponse.json();
	const { csrfToken } = await csrfResponse.json();
	// Auth.js can issue a CSRF cookie in both responses. Send the cookie
	// generated for the form token last so it takes precedence.
	const headers = new Headers(sessionResponse.headers);
	csrfResponse.headers.forEach((value, name) => {
		if (name === "set-cookie") headers.append(name, value);
	});
	return json({ session, csrfToken, mockatooUrl: MOCKATOO_URL }, { headers });
}

export default function Home() {
	const { session, csrfToken, mockatooUrl } = useLoaderData<typeof loader>();
	const [searchParams] = useSearchParams();
	const [pending, setPending] = useState(false);

	useEffect(() => {
		const resetPending = () => setPending(false);
		window.addEventListener("pageshow", resetPending);
		return () => window.removeEventListener("pageshow", resetPending);
	}, []);
	return (
		<main>
			<section className="card" aria-labelledby="title">
				<a
					className="brand"
					href="https://github.com/mockatoo/examples/tree/main/authjs-remix"
				>
					<span className="brand-logo" aria-hidden="true" />
					Mockatoo Auth.js Remix Example
				</a>
				{searchParams.has("error") && (
					<p role="alert" className="error">
						Sign-in failed. The provider did not complete sign-in. You may have
						declined the authorization request. Please try again.
					</p>
				)}
				{session?.user ? (
					<>
						<p className="signed-in">You are logged in</p>
						<h1 id="title" className="session-title">
							Your session
						</h1>
						<p>{session.user.email || session.user.name}</p>
						<pre className="session-json">
							<code>{JSON.stringify(session, null, 2)}</code>
						</pre>
						<a
							className="cta"
							href={mockatooUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							Explore Mockatoo
						</a>
						<form
							method="post"
							action="/api/auth/signout"
							onSubmit={() => setPending(true)}
						>
							<input type="hidden" name="csrfToken" value={csrfToken} />
							<input type="hidden" name="callbackUrl" value="/" />
							<button type="submit" className="secondary" disabled={pending}>
								Sign out
							</button>
						</form>
					</>
				) : (
					<>
						<h1 id="title">Welcome back</h1>
						<p>
							Please sign in with one of the providers below. We will request
							access to your basic profile and email where available.
						</p>
						<div className="providers">
							{providers.map((provider) => (
								<div className="provider" key={provider.id}>
									<form
										method="post"
										action={`/api/auth/signin/${provider.id}`}
										onSubmit={() => setPending(true)}
									>
										<input type="hidden" name="csrfToken" value={csrfToken} />
										<input type="hidden" name="callbackUrl" value="/" />
										<button type="submit" disabled={pending}>
											<ProviderLogo id={provider.id} />
											Sign in with {provider.name}
										</button>
									</form>
								</div>
							))}
						</div>
					</>
				)}
			</section>
		</main>
	);
}
