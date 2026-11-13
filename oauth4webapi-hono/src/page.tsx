import { ProviderLogo } from "./provider-logo.js";

type PageProps = {
	email?: string;
	error?: string;
	providers: { id: string; name: string }[];
};

export function Page({ email, error, providers }: PageProps) {
	return (
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Hono + oauth4webapi</title>
				<style>{`
body{margin:0;background:#f4f5f2;color:#202a37;font:16px/1.6 system-ui}main{max-width:440px;margin:12vh auto;padding:32px;background:white;border-radius:16px}h1{font-size:26px}button{background:#204f3d;color:white;border:0;border-radius:8px;padding:12px 20px;font:inherit;cursor:pointer}.providers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.providers button{width:100%;display:flex;align-items:center;justify-content:center;gap:.6rem;background:white;color:#204f3d;border:1px solid #c9d8ce;padding:.75rem .45rem;font-size:.9rem;font-weight:650}.providers button:hover{background:#edf4ef}button:focus-visible{outline:3px solid #78af92;outline-offset:3px}svg{width:20px;height:20px;flex:none;color:#204f3d}button:hover{background:#163c2e}p{overflow-wrap:anywhere}@media(max-width:400px){.providers{grid-template-columns:1fr}}@media(max-width:540px){main{margin:24px;padding:24px}}`}</style>
			</head>
			<body>
				<main>
					<p>Minimal framework example</p>
					<h1>Hono + oauth4webapi</h1>
					<p>
						Authorization code flow with PKCE and OpenID Connect, using the
						protocol library directly.
					</p>
					{error && (
						<p role="alert">
							Sign-in failed. Authorization was declined or could not be
							verified. Please try again.
						</p>
					)}
					{email ? (
						<>
							<p>You are logged in as {email}</p>
							<form method="post" action="/sign-out">
								<button type="submit">Sign out</button>
							</form>
						</>
					) : (
						<div class="providers">
							{providers.map((provider) => (
								<form method="post" action="/sign-in">
									<button type="submit" name="provider" value={provider.id}>
										<ProviderLogo
											id={
												provider.id === "microsoft"
													? "microsoft-entra-id"
													: provider.id
											}
										/>
										{`Sign in with ${provider.name}`}
									</button>
								</form>
							))}
						</div>
					)}
				</main>
			</body>
		</html>
	);
}
