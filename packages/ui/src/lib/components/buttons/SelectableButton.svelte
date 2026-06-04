<script lang="ts">
	import type { Snippet } from "svelte";
	import { Button as ShadcnButton } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils/cn.js";

	let {
		selected = false,
		onclick,
		children,
	}: {
		selected?: boolean;
		onclick?: (e: MouseEvent) => void;
		children?: Snippet;
	} = $props();
</script>

<ShadcnButton
	variant="ghost"
	class={cn(
		"h-auto min-h-12 w-full justify-start py-3 px-4 rounded-lg duration-300 border-transparent",
		selected
			? "bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-500 dark:hover:bg-zinc-600"
			: "hover:bg-zinc-100 dark:hover:bg-zinc-700",
	)}
	{onclick}
>
	{@render children?.()}
</ShadcnButton>
