<script lang="ts">
	import type { Snippet } from "svelte";
	import { Badge } from "$lib/components/ui/badge/index.js";

	let { children }: { children?: Snippet } = $props();
</script>

<Badge
	class="rounded-md bg-zinc-200/70 px-2 py-0.5 font-mono text-sm font-medium tabular-nums text-zinc-700 dark:bg-zinc-700/60 dark:text-zinc-200"
>
	{@render children?.()}
</Badge>
