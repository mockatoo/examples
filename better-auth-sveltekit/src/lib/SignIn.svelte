<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import { authClient } from "$lib/auth-client";
	import { providers } from "$lib/providers";
	import ProviderLogo from "$lib/ProviderLogo.svelte";

	let { signedIn = false, error }: { signedIn?: boolean; error?: string } = $props();
	let pending = $state(false);
	let message = $state("");
	let alertMessage = $derived(
		message || (error ? `Sign-in failed. ${error}` : ""),
	);

	async function signIn(provider: (typeof providers)[number]["id"]) {
		pending = true;
		message = "";
		try {
			const result = await authClient.signIn.social({
				provider,
				callbackURL: "/",
				errorCallbackURL: "/",
			});
			if (result.error)
				message = `Sign-in failed. ${result.error.message ?? "Please try again."}`;
		} catch {
			message = "Sign-in failed. Please try again.";
		} finally {
			pending = false;
		}
	}

	async function signOut() {
		pending = true;
		message = "";
		try {
			const result = await authClient.signOut();
			if (result.error) {
				message = `Sign-out failed. ${result.error.message ?? "Please try again."}`;
				return;
			}
			await invalidateAll();
		} catch {
			message = "Sign-out failed. Please try again.";
		} finally {
			pending = false;
		}
	}
</script>

<div class="actions">
	{#if signedIn}
		<button type="button" class="secondary" onclick={signOut} disabled={pending}>
			{pending ? "Please wait…" : "Sign out"}
		</button>
	{:else}
		<div class="providers">
			{#each providers as provider (provider.id)}
				<div class="provider">
					<button
						type="button"
						aria-label={provider.id === "google" ? "Sign in" : undefined}
						onclick={() => signIn(provider.id)}
						disabled={pending}
					>
						<ProviderLogo id={provider.logo} />
						{pending ? "Please wait…" : `Sign in with ${provider.name}`}
					</button>
				</div>
			{/each}
		</div>
	{/if}
	{#if alertMessage}<p role="alert">{alertMessage}</p>{/if}
</div>
