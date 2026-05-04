<script lang="ts">
	import Gate from "$lib/components/io/Gate.svelte";
	import { realtime } from "$lib/utils/stores/nuster";
	import { page } from "$app/stores";

    let gates = $derived($realtime.io.filter(i => i.bus === $page.params.bus));
</script>

{#each gates as gate (gate.name)}
	<Gate io={gate} editable={gate.bus === "out"}/>
{/each}
