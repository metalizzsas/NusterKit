<script lang="ts">
    import type { Writable } from "svelte/store";
	import { getContext } from "svelte";
	import { settings } from "$lib/utils/stores/settings";

    export let href = '';
    const selectedHelp = getContext<Writable<string | undefined>>("help");
</script>

<button on:click={() => $selectedHelp = `/${$settings.lang}/${href}`}><slot /> {href}</button>
  