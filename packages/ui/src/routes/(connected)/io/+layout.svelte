<script lang="ts">
	import type { Snippet } from "svelte";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import Wrapper from "$lib/components/Wrapper.svelte";
	import Flex from "$lib/components/layout/flex.svelte";
	import PageHeader from "$lib/components/PageHeader.svelte";
	import { ArrowLeftOnRectangle, ArrowRightOnRectangle } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { cn } from "$lib/utils/cn.js";
	import { _ } from "svelte-i18n";

	let { children }: { children: Snippet } = $props();

	const buses = [
		{ bus: "in", icon: ArrowLeftOnRectangle },
		{ bus: "out", icon: ArrowRightOnRectangle },
	] as const;
</script>

<PageHeader title={$_(`gates.lead`)} />

<!-- Segmented bus switch -->
<div class="mb-4 inline-flex gap-0.5 rounded-xl bg-zinc-200/70 p-1 dark:bg-zinc-800/80">
	{#each buses as { bus, icon } (bus)}
		{@const active = $page.params.bus === bus}
		<button
			type="button"
			onclick={() => { if (!active) void goto(`/io/${bus}`); }}
			class={cn(
				"flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
				active
					? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-600/90 dark:text-white"
					: "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100",
			)}
		>
			<Icon src={icon} class="h-4 w-4" />
			{$_('gates.bus.' + bus)}
		</button>
	{/each}
</div>

<Wrapper>
	<Flex direction="col" gap={6}>
		{@render children()}
	</Flex>
</Wrapper>
