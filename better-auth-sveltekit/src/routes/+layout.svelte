<script lang="ts">
	import "./style.css";
	let { children } = $props();
</script>

<svelte:head>
	<title>Better Auth + Mockatoo</title>
</svelte:head>

{@render children()}
