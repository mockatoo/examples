<script setup lang="ts">
import type { Session } from "@auth/core/types";
import { providers } from "./lib/providers";

const route = useRoute();
const { data: session } = await useFetch<Session | null>("/api/auth/session");
const pending = ref(false);
const failed = ref(false);

async function submit(provider?: string) {
	pending.value = true;
	failed.value = false;
	try {
		const { csrfToken } = await $fetch<{ csrfToken: string }>("/api/auth/csrf");
		const result = await $fetch<{ url: string }>(
			provider ? `/api/auth/signin/${provider}` : "/api/auth/signout",
			{
				method: "POST",
				headers: { "X-Auth-Return-Redirect": "1" },
				body: new URLSearchParams({ csrfToken, callbackUrl: "/" }),
			},
		);
		window.location.assign(result.url);
	} catch {
		failed.value = true;
		pending.value = false;
	}
}
</script>

<template>
	<main>
		<section class="card" aria-labelledby="title">
			<a class="brand" href="https://github.com/mockatoo/examples/tree/main/authjs-nuxt">
				<span class="brand-logo" aria-hidden="true" />
				Mockatoo Auth.js Nuxt Example
			</a>
			<p v-if="route.query.error || failed" role="alert" class="error">Sign-in failed. The provider did not complete sign-in. You may have declined the authorization request. Please try again.</p>
			<template v-if="session?.user">
				<p class="signed-in">You are logged in</p>
				<h1 id="title" class="session-title">Your session</h1>
				<p>{{ session.user.email || session.user.name }}</p>
				<pre class="session-json"><code>{{ JSON.stringify(session, null, 2) }}</code></pre>
				<a class="cta" href="https://app.mockatoo.globalunderdog.com" target="_blank" rel="noopener noreferrer">Explore Mockatoo</a>
				<form @submit.prevent="submit()">
					<button class="secondary" :disabled="pending">Sign out</button>
				</form>
			</template>
			<template v-else>
				<h1 id="title">Welcome back</h1>
				<p>Please sign in with one of the providers below. We will request access to your basic profile and email where available.</p>
				<div class="providers">
					<div v-for="provider in providers" :key="provider.id" class="provider">
						<form @submit.prevent="submit(provider.id)">
							<button :disabled="pending"><ProviderLogo :id="provider.id" />Sign in with {{ provider.name }}</button>
						</form>
					</div>
				</div>
			</template>
		</section>
	</main>
</template>
