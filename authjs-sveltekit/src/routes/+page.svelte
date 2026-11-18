<script lang="ts">
	import ProviderLogo from "#lib/ProviderLogo.svelte";
	import { providers } from "#lib/providers.ts";
	import type { PageData } from "./$types";
	let { data }: { data: PageData } = $props();
	let pending = $state(false);
	let actionError = $state("");
	async function submit(provider?: string) {
		pending = true;
		actionError = "";
		try {
			const csrf = await fetch("/auth/csrf");
			if (!csrf.ok) throw new Error("Could not load CSRF token");
			const { csrfToken } = await csrf.json();
			const response = await fetch(provider ? `/auth/signin/${provider}` : "/auth/signout", {
				method: "POST",
				headers: { "X-Auth-Return-Redirect": "1" },
				body: new URLSearchParams({ csrfToken, callbackUrl: "/" }),
			});
			if (!response.ok) throw new Error("Auth action failed");
			const { url } = await response.json();
			window.location.assign(url);
		} catch {
			actionError = provider ? "Sign-in failed. Please try again." : "Sign-out failed. Please try again.";
			pending = false;
		}
	}
</script>

<main>
	<section class="card" aria-labelledby="title">
		<a class="brand" href="https://github.com/mockatoo/examples/tree/main/authjs-sveltekit">
			<span class="brand-logo" aria-hidden="true"></span>
			Mockatoo Auth.js SvelteKit Example
		</a>
		{#if data.session?.user}
			<p class="signed-in">You are logged in</p>
			<h1 class="session-title" id="title">Your session</h1>
			<p class="email">{data.session.user.email || data.session.user.name}</p>
			<pre class="session-json"><code>{JSON.stringify(data.session, null, 2)}</code></pre>
			<a class="cta" href={data.mockatooUrl} target="_blank" rel="noopener noreferrer">Explore Mockatoo</a>
			<button class="secondary" disabled={pending} onclick={() => submit()}>Sign out</button>
			{#if actionError}<p role="alert">{actionError}</p>{/if}
		{:else}
			<h1 id="title">Welcome back</h1>
			<p>Please sign in with one of the providers below. We will request access to your basic profile and email where available.</p>
			<div class="actions">
				{#if actionError}
					<p role="alert">{actionError}</p>
				{:else if data.error}
					<p role="alert">Sign-in failed. The provider did not complete sign-in. You may have declined the authorization request. Please try again.</p>
				{/if}
				<div class="providers">
					{#each providers as provider (provider.id)}
						<div class="provider">
							<button aria-label={provider.id === "google" ? "Sign in" : undefined} disabled={pending} onclick={() => submit(provider.id)}>
								<ProviderLogo id={provider.id} />
								Sign in with {provider.name}
							</button>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</section>
	<footer>Built with Auth.js and Mockatoo</footer>
</main>
