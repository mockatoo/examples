import { headers } from "next/headers";
import { auth } from "../lib/auth";
import SignIn from "./sign-in";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const [session, params] = await Promise.all([
		auth.api.getSession({ headers: await headers() }),
		searchParams,
	]);
	return (
		<main>
			<section className="card" aria-labelledby="title">
				<a
					className="brand"
					href="https://github.com/mockatoo/examples/tree/main/better-auth-next"
				>
					<span className="brand-logo" aria-hidden="true" />
					Mockatoo Better Auth Next Example
				</a>
				{session ? (
					<>
						<p className="signed-in">You are logged in</p>
						<h1 className="session-title" id="title">
							Your session
						</h1>
						<pre className="session-json">
							<code>{JSON.stringify(session, null, 2)}</code>
						</pre>
						<a
							className="cta"
							href="https://app.mockatoo.globalunderdog.com"
							target="_blank"
							rel="noopener noreferrer"
						>
							Explore Mockatoo
						</a>
						<SignIn signedIn />
					</>
				) : (
					<>
						<h1 id="title">Welcome back</h1>
						<p>
							Please sign in with one of the providers below. We will request
							access to your basic profile and email where available.
						</p>
						<SignIn error={params.error} />
					</>
				)}
			</section>
			<footer>Built with Better Auth and Mockatoo</footer>
		</main>
	);
}
