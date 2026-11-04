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
				<a className="brand" href="https://mockatoo.globalunderdog.com">
					<span className="brand-mark" aria-hidden="true">
						M
					</span>
					Mockatoo · Better Auth
				</a>
				{session ? (
					<>
						<p className="eyebrow">You are signed in</p>
						<h1 id="title">Your account</h1>
						<p className="email">{session.user.email}</p>
						<SignIn signedIn />
					</>
				) : (
					<>
						<p className="eyebrow">Welcome</p>
						<h1 id="title">Sign in to your account</h1>
						<p>Use Mockatoo to try a complete OAuth sign-in flow.</p>
						<SignIn error={params.error} />
					</>
				)}
			</section>
			<footer>Built with Better Auth and Mockatoo</footer>
		</main>
	);
}
