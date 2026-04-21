<script lang="ts">
	import type { Snippet } from "svelte";

	let { children }: { children?: Snippet } = $props();
</script>

<span class="py-0.5 px-2 rounded-full bg-zinc-800 dark:bg-white dark:text-zinc-800 text-white text-sm">
    {@render children?.()}
</span>
