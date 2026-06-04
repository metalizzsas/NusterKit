<script lang="ts">
	import type { IconSource } from "@steeze-ui/svelte-icon";
	import { Icon } from "@steeze-ui/svelte-icon";
	import type { Snippet } from "svelte";

	let {
		icon,
		title,
		description = undefined,
		action,
	}: {
		icon: IconSource;
		title: string;
		description?: string;
		action?: Snippet;
	} = $props();
</script>

<div
	class="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center text-zinc-700 dark:text-zinc-300"
>
	<div
		class="grid h-14 w-14 place-items-center rounded-full bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-300"
	>
		<Icon src={icon} theme="solid" class="h-7 w-7" />
	</div>
	<h3 class="text-base font-semibold text-zinc-900 dark:text-white">{title}</h3>
	{#if description}
		<p class="max-w-xs text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
	{/if}
	{#if action}
		<div class="mt-2">{@render action()}</div>
	{/if}
</div>
