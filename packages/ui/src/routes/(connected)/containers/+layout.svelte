<script lang="ts">
	import type { Snippet } from "svelte";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import Flex from "$lib/components/layout/flex.svelte";
	import EmptyState from "$lib/components/EmptyState.svelte";
	import PageHeader from "$lib/components/PageHeader.svelte";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { Beaker, ChevronRight } from "@steeze-ui/heroicons";
	import { computeContainersState } from "$lib/utils/state";
	import { realtime } from "$lib/utils/stores/nuster";
	import { cn } from "$lib/utils/cn.js";
	import { _ } from "svelte-i18n";
	import type { LayoutData } from "./$types";

    let { data, children }: { data: LayoutData; children: Snippet } = $props();

    let containers = $derived($realtime.containers);
    let activeContainerName = $derived($page.params.id);

    // Always keep a container selected — land on the first one.
    $effect(() => {
        if (activeContainerName === undefined && containers.length > 0) {
            void goto(`/containers/${containers[0].name}`, { replaceState: true });
        }
    });

    const dotClass = (result: "error" | "warn" | "good" | "info") =>
        cn(
            "h-2.5 w-2.5 shrink-0 rounded-full",
            result === "error" && "bg-red-500",
            result === "warn" && "bg-amber-500",
            result === "good" && "bg-emerald-500",
            result === "info" && "bg-blue-500",
        );
</script>

<PageHeader title={$_(`container.lead`)} />

{#if containers.length === 0}
	<div class="rounded-xl border border-border bg-card">
		<EmptyState
			icon={Beaker}
			title={$_('container.empty.title')}
			description={$_('container.empty.description')}
		/>
	</div>
{:else}
	<Flex direction="row" gap={6}>
		<div class="w-72 shrink-0">
			<div class="overflow-hidden rounded-xl border border-border bg-card">
				{#each containers as container, index (container.name)}
					{@const containerState = computeContainersState(container, $realtime.io)}
					{@const active = activeContainerName === container.name}
					<button
						type="button"
						onclick={() => { if (!active) void goto(`/containers/${container.name}`); }}
						class={cn(
							"group relative flex w-full items-center gap-3 p-3.5 text-left transition-colors",
							index > 0 && "border-t border-border",
							active
								? "bg-indigo-500/10 before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-indigo-500 dark:bg-indigo-400/10 dark:before:bg-indigo-400"
								: "hover:bg-zinc-900/[0.03] dark:hover:bg-white/[0.04]",
						)}
					>
						<div class={dotClass(containerState.result)}></div>
						<div class="min-w-0 grow">
							<h3 class={cn("truncate text-base font-semibold leading-snug", active && "text-indigo-700 dark:text-indigo-200")}>
								{$_(`containers.${container.name}.name`)}
							</h3>
							{#each containerState.issues as issue (issue)}
								<p class="truncate text-xs text-zinc-500 dark:text-zinc-400">{$_(`container.state.issues.${issue}`)}</p>
							{/each}
							{#each containerState.infos as info (info)}
								<p class="truncate text-xs text-zinc-500 dark:text-zinc-400">{$_(`container.state.infos.${info}`)}</p>
							{/each}
						</div>
						<Icon
							src={ChevronRight}
							theme="mini"
							class={cn("h-4 w-4 shrink-0 text-zinc-400 transition-opacity", active ? "opacity-0" : "opacity-100")}
						/>
					</button>
				{/each}
			</div>
		</div>

		<div class="min-w-0 grow">
			{@render children()}
		</div>
	</Flex>
{/if}
