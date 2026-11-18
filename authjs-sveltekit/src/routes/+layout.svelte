<script lang="ts">
	import "./style.css";
	let { children } = $props();
</script>

<svelte:head>
	<title>Auth.js + Mockatoo</title>
</svelte:head>

{@render children()}
