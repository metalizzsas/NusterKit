<script lang="ts">
	import { Progress as ProgressPrimitive } from "bits-ui";
	import { tweened } from "svelte/motion";
	import { cubicOut } from "svelte/easing";
	import { cn } from "$lib/utils/cn.js";

	let {
		progress,
		showProgressLabel = false,
	}: {
		progress: number | null;
		showProgressLabel?: boolean;
	} = $props();

	const springProgress = tweened(0, {
		duration: 500,
		easing: cubicOut,
	});

	$effect(() => {
		springProgress.set(progress ?? 1);
	});
</script>

<ProgressPrimitive.Root
	value={progress === null ? null : Math.round(($springProgress ?? 0) * 100)}
	max={100}
	class={cn(
		"relative h-1.5 w-full grow overflow-visible rounded-full bg-zinc-600/50",
		showProgressLabel && "my-2",
	)}
>
	{#if showProgressLabel}
		<span
			class={cn(
				"absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-0.5 text-xs font-medium text-white",
				progress === null ? "bg-zinc-400 dark:bg-zinc-500" : "bg-indigo-500",
			)}
		>
			{#if progress === null}
				— %
			{:else}
				{Math.floor((progress ?? 1) * 100)} %
			{/if}
		</span>
	{/if}
	<div
		class={cn(
			"h-1.5 rounded-full",
			progress === null ? "bg-zinc-400 dark:bg-zinc-500 animate-pulse" : "bg-indigo-500",
		)}
		style:width={`${$springProgress * 100}%`}
	></div>
</ProgressPrimitive.Root>
