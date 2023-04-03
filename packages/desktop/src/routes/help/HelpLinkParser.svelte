<script lang="ts">
    import type { Writable } from "svelte/store";
	import { getContext } from "svelte";

    export let href = '';
    const selectedHelp = getContext<Writable<string | undefined>>("help");
</script>

<button on:click={() => $selectedHelp = href } class="text-indigo-500 font-medium hover:text-indigo-600 duration-100"><slot /></button>
  