<script lang="ts">
	import PageTransition from '$lib/components/PageTransition.svelte';

	import { onMount } from 'svelte';

	let ready: boolean = false;
	onMount(() => (ready = true));
</script>

<!-- <div class="dragbar" /> -->

{#if ready}
	<PageTransition>
		<slot />
	</PageTransition>
{/if}
