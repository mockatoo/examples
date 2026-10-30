import { auth, signIn, signOut } from "../lib/auth";
import { providers } from "../lib/providers";
import { Button } from "./button";
import { ProviderLogo } from "./provider-logo";

const errors: Record<string, string> = {
	OAuthCallbackError:
		"The provider did not complete sign-in. You may have declined the authorization request, or the provider may have encountered an error.",
	AccessDenied:
		"Access to this account was denied. Check that you are allowed to sign in with this account.",
	OAuthAccountNotLinked:
		"This email is already associated with another sign-in method. Use the original provider to sign in.",
	Configuration:
		"Sign-in could not be completed. Please try again later or contact the site administrator if the problem continues.",
	Verification:
		"The sign-in link has expired or has already been used. Start a new sign-in request.",
};

export default async function Home({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const session = await auth();
	const { error } = await searchParams;
	return (
		<main>
			<section className="card">
				<a
					className="brand"
					href="https://github.com/mockatoo/examples/tree/main/authjs-next"
				>
					<span className="brand-logo" aria-hidden="true" />
					Mockatoo Authjs Next Example
				</a>
				{session?.user ? (
					<>
						<p className="signed-in">You are logged in</p>
						<h1 className="session-title">Your session</h1>
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
						<form
							action={async () => {
								"use server";
								await signOut({ redirectTo: "/" });
							}}
						>
							<Button className="secondary">Sign out</Button>
						</form>
					</>
				) : (
					<>
						<h1>Welcome back</h1>
						<p>
							Please sign in with one of the providers below. We will request
							access to your basic profile and email where available.
						</p>
						{error && (
							<p role="alert" className="error">
								Sign-in failed.{" "}
								{(Object.hasOwn(errors, error) ? errors[error] : undefined) ??
									"We could not complete sign-in. Please try again or contact the site administrator if the problem continues."}
							</p>
						)}
						<div className="providers">
							{providers.map((provider) => (
								<div className="provider" key={provider.id}>
									<form
										action={async () => {
											"use server";
											await signIn(provider.id, { redirectTo: "/" });
										}}
									>
										<Button>
											<ProviderLogo id={provider.id} />
											{`Sign in with ${provider.name}`}
										</Button>
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
