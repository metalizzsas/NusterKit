<script lang="ts">
	import type { TailwindColors } from "$lib/utils/types/colors";
	import type { Snippet } from "svelte";
	import { Button as ShadcnButton } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils/cn.js";

	let {
		color = "hover:bg-emerald-500",
		ringColor = "ring-emerald-500",
		textColor = "text-zinc-800 dark:text-white",
		textHoverColor = "hover:text-white dark:hover:text-white",
		disabled = false,
		size = "base",
		type = "submit",
		class: class_name = "",
		children,
		onclick,
	}: {
		color?: TailwindColors<"bg", true>;
		ringColor?: TailwindColors<"ring", false>;
		textColor?: TailwindColors<"text", false>;
		textHoverColor?: TailwindColors<"text", true>;
		disabled?: boolean;
		size?: "base" | "small";
		/** Native button type — defaults to "submit" so Buttons inside forms submit them (HTML default). */
		type?: "submit" | "button" | "reset";
		class?: string;
		children?: Snippet;
		onclick?: (e: MouseEvent) => void;
	} = $props();

	const sizeClasses = {
		base: "h-11 min-h-11 px-5 py-2.5 text-base font-semibold rounded-lg",
		small: "h-9 min-h-9 px-3 py-1.5 text-sm font-medium rounded-lg",
	} as const;

	/* Quiet bordered button: neutral surface, the semantic accent (derived from the
	   legacy `ringColor` prop) only shows on hover/press — calmer than the old
	   full-color outlines while keeping the existing call-site API. */
	const accentClasses: Record<string, string> = {
		emerald: "hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-500/5 dark:hover:text-emerald-300",
		red: "hover:border-red-500 hover:text-red-700 hover:bg-red-500/5 dark:hover:text-red-300",
		amber: "hover:border-amber-500 hover:text-amber-700 hover:bg-amber-500/5 dark:hover:text-amber-300",
		yellow: "hover:border-yellow-500 hover:text-yellow-700 hover:bg-yellow-500/5 dark:hover:text-yellow-300",
		indigo: "hover:border-indigo-500 hover:text-indigo-700 hover:bg-indigo-500/5 dark:hover:text-indigo-300",
		gray: "hover:border-zinc-400 hover:text-zinc-900 hover:bg-zinc-500/5 dark:hover:text-zinc-100",
	};

	const accent = $derived(accentClasses[ringColor.match(/ring-([a-z]+)-/)?.[1] ?? "emerald"] ?? accentClasses.emerald);
</script>

<ShadcnButton
	class={cn(
		"border border-border bg-white text-zinc-700 transition-colors duration-200 dark:bg-zinc-800 dark:text-zinc-200",
		sizeClasses[size],
		accent,
		disabled && "pointer-events-none opacity-50",
		class_name,
	)}
	{disabled}
	{type}
	{onclick}
>
	{@render children?.()}
</ShadcnButton>
