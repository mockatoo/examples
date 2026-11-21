<script setup lang="ts">
import { providers } from "~~/shared/providers";

const { mockatooUrl } = useRuntimeConfig().public;
const route = useRoute();
const { loggedIn, user, clear } = useUserSession();
const pending = ref(false);

function signIn(provider: string) {
	pending.value = true;
	window.location.assign(`/auth/${provider}`);
}

async function signOut() {
	pending.value = true;
	await clear();
	pending.value = false;
}
</script>

<template>
	<main>
		<section class="card" aria-labelledby="title">
			<a class="brand" href="https://github.com/mockatoo/examples/tree/main/nuxt-auth-utils-nuxt">
				<span class="brand-logo" aria-hidden="true" />
				Mockatoo nuxt-auth-utils Example
			</a>
			<p v-if="route.query.error" role="alert" class="error">Sign-in failed. The provider did not complete sign-in. You may have declined the authorization request. Please try again.</p>
			<template v-if="loggedIn && user">
				<p class="signed-in">You are logged in</p>
				<h1 id="title" class="session-title">Your session</h1>
				<p>{{ user.email || user.name }}</p>
				<pre class="session-json"><code>{{ JSON.stringify(user, null, 2) }}</code></pre>
				<a class="cta" :href="mockatooUrl" target="_blank" rel="noopener noreferrer">Explore Mockatoo</a>
				<form @submit.prevent="signOut">
					<button class="secondary" :disabled="pending">Sign out</button>
				</form>
			</template>
			<template v-else>
				<h1 id="title">Welcome back</h1>
				<p>Please sign in with one of the providers below. We will request access to your basic profile and email where available.</p>
				<div class="providers">
					<div v-for="provider in providers" :key="provider.id" class="provider">
						<form @submit.prevent="signIn(provider.id)">
							<button :disabled="pending"><ProviderLogo :id="provider.id" />Sign in with {{ provider.name }}</button>
						</form>
					</div>
				</div>
			</template>
		</section>
	</main>
</template>
