<script lang="ts">
	import type { Snippet } from "svelte";
	import { goto } from "$app/navigation";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { ArrowLeft } from "@steeze-ui/heroicons";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Button } from "$lib/components/ui/button/index.js";

	let {
		title,
		subtitle = undefined,
		back = undefined,
		onBack = undefined,
		actions,
	}: {
		title: string;
		subtitle?: string;
		/** Pass a route to goto, or `true` to use history.back. */
		back?: string | true;
		/** Override default back behavior (e.g. show a confirm dialog). When set, `back` is only used as semantic indicator that the back button should render. */
		onBack?: () => void;
		actions?: Snippet;
	} = $props();

	const showBack = $derived(back !== undefined || onBack !== undefined);

	const handleBack = () => {
		if (onBack) {
			onBack();
			return;
		}
		if (back === true) {
			history.back();
		} else if (typeof back === "string") {
			void goto(back);
		}
	};
</script>

<header class="mb-6 flex items-center gap-2.5">
	<Sidebar.Trigger
		class="size-10 shrink-0 rounded-lg border border-border bg-white text-zinc-600 transition-colors hover:border-indigo-400 hover:bg-white hover:text-indigo-500 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 [&_svg]:size-5"
	/>

	{#if showBack}
		<Button
			variant="ghost"
			size="icon"
			class="size-10 shrink-0 rounded-lg border border-border bg-white text-zinc-600 transition-colors hover:border-indigo-400 hover:bg-white hover:text-indigo-500 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
			onclick={handleBack}
		>
			<Icon src={ArrowLeft} class="size-5" />
			<span class="sr-only">Back</span>
		</Button>
	{/if}

	<div class="min-w-0 flex-1">
		<h1 class="truncate text-2xl font-bold leading-tight text-foreground">{title}</h1>
		{#if subtitle}
			<p class="truncate text-sm text-muted-foreground">{subtitle}</p>
		{/if}
	</div>

	{#if actions}
		<div class="flex shrink-0 items-center gap-2">
			{@render actions()}
		</div>
	{/if}
</header>
