<script lang="ts">
	import Gate from "$lib/components/io/Gate.svelte";
	import { realtime } from "$lib/utils/stores/nuster";
	import { page } from "$app/stores";
</script>

{#each $realtime.io.filter(i => i.bus === $page.params.bus) as iog}
	<Gate bind:io={iog} editable={iog.bus === "out"}/>
{/each}