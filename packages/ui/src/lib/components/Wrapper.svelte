<script lang="ts">
	import type { Snippet } from "svelte";
	import { Card } from "$lib/components/ui/card/index.js";
	import { cn } from "$lib/utils/cn.js";

	let {
		padding = "p-6",
		variant = "default",
		class: class_name = "",
		children,
	}: {
		padding?: `p-${number}`;
		variant?: "default" | "muted";
		class?: string;
		children?: Snippet;
	} = $props();

	const variantStyles = {
		default: "bg-white dark:bg-card",
		muted: "bg-zinc-50 dark:bg-zinc-700/60",
	} as const;
</script>

<Card
	class={cn(
		"flex-none gap-0 py-0 text-zinc-800 dark:text-white rounded-xl ring-0",
		"border border-border",
		"shadow-sm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_4px_24px_-8px_rgba(0,0,0,0.5)]",
		"overflow-visible",
		variantStyles[variant],
		padding,
		class_name,
	)}
>
	{@render children?.()}
</Card>
