<script lang="ts">
	import type { Snippet } from "svelte";
	import Flex from "$lib/components/layout/flex.svelte";
	import EmptyState from "$lib/components/EmptyState.svelte";
	import PageHeader from "$lib/components/PageHeader.svelte";
	import { Wrench } from "@steeze-ui/heroicons";
	import { cn } from "$lib/utils/cn.js";

	import { _ } from "svelte-i18n";
	import type { LayoutData } from "./$types";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
	let activeMaintenanceName = $derived($page.params.id);

	// Always keep a task selected — land on the first one.
	$effect(() => {
		if (activeMaintenanceName === undefined && data.maintenances.length > 0) {
			void goto(`/maintenances/${data.maintenances[0].name}`, { replaceState: true });
		}
	});

	/** Wear color by usage ratio — green under 75%, amber under 100%, red past due. */
	const wear_color = (progress: number) => {
		if (progress >= 1 || progress === -1) return "bg-red-500";
		if (progress >= 0.75) return "bg-amber-500";
		return "bg-emerald-500";
	};
</script>

<PageHeader title={$_(`maintenance.lead`)} />

{#if data.maintenances.length === 0}
	<div class="rounded-xl border border-border bg-card">
		<EmptyState
			icon={Wrench}
			title={$_('maintenance.empty.title')}
			description={$_('maintenance.empty.description')}
		/>
	</div>
{:else}
	<Flex direction="row" gap={6}>
		<div class="w-72 shrink-0">
			<div class="overflow-hidden rounded-xl border border-border bg-card">
				{#each data.maintenances as maintenance, index (maintenance.name)}
					{@const active = activeMaintenanceName === maintenance.name}
					{@const ratio = Math.min(Math.max(maintenance.durationProgress, 0), 1)}
					<button
						type="button"
						onclick={() => { if (!active) void goto(`/maintenances/${maintenance.name}`); }}
						class={cn(
							"group relative flex w-full flex-col gap-2 p-3.5 text-left transition-colors",
							index > 0 && "border-t border-border",
							active
								? "bg-indigo-500/10 before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-indigo-500 dark:bg-indigo-400/10 dark:before:bg-indigo-400"
								: "hover:bg-zinc-900/[0.03] dark:hover:bg-white/[0.04]",
						)}
					>
						<div class="flex w-full items-baseline justify-between gap-2">
							<h3 class={cn("truncate text-base font-semibold leading-snug", active && "text-indigo-700 dark:text-indigo-200")}>
								{$_('maintenance.tasks.' + maintenance.name + '.name')}
							</h3>
							<span class="shrink-0 font-mono text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
								{#if maintenance.durationType === "sensor"}
									{maintenance.duration === -1 ? "—" : maintenance.duration}/{maintenance.durationMax}&nbsp;{maintenance.sensorUnit ?? ""}
								{:else}
									{maintenance.duration === -1 ? "—" : maintenance.duration}/{maintenance.durationMax}
								{/if}
							</span>
						</div>

						<!-- Wear gauge -->
						<div class="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/80 dark:bg-zinc-700/80">
							<div
								class={cn("h-full rounded-full transition-all", wear_color(maintenance.durationProgress))}
								style="width: {maintenance.durationProgress === -1 ? 100 : ratio * 100}%"
							></div>
						</div>
					</button>
				{/each}
			</div>
		</div>

		<div class="min-w-0 grow">
			{@render children()}
		</div>
	</Flex>
{/if}
