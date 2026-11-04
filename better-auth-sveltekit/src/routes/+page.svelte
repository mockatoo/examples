<script lang="ts">
	import SignIn from "$lib/SignIn.svelte";
	import type { PageData } from "./$types";
	let { data }: { data: PageData } = $props();
</script>

<main>
	<section class="card" aria-labelledby="title">
		<a class="brand" href="https://github.com/mockatoo/examples/tree/main/better-auth-sveltekit">
			<span class="brand-logo" aria-hidden="true"></span>
			Mockatoo Better Auth SvelteKit Example
		</a>
		{#if data.session}
			<p class="signed-in">You are logged in</p>
			<h1 class="session-title" id="title">Your session</h1>
			<p class="email">{data.session.user.email}</p>
			<pre class="session-json"><code>{JSON.stringify(data.session, null, 2)}</code></pre>
			<a class="cta" href="https://app.mockatoo.globalunderdog.com" target="_blank" rel="noopener noreferrer">Explore Mockatoo</a>
			<SignIn signedIn />
		{:else}
			<h1 id="title">Welcome back</h1>
			<p>Please sign in with one of the providers below. We will request access to your basic profile and email where available.</p>
			<SignIn error={data.error ?? undefined} />
		{/if}
	</section>
	<footer>Built with Better Auth and Mockatoo</footer>
</main>
