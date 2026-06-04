<script lang="ts">
import { ArrowDown, ArrowPath, Check, XMark } from "@steeze-ui/heroicons";
import { Icon } from "@steeze-ui/svelte-icon";
import { _ } from "svelte-i18n";
import { page } from "$app/stores";
import Flex from "$lib/components/layout/flex.svelte";
import ProgressBarGroup from "$lib/components/ProgressBarGroup.svelte";
import type { PBRStepHydrated } from "$lib/types/turbine";
import { cn } from "$lib/utils/cn.js";

let { step, stepNumber = undefined }: { step: PBRStepHydrated; stepNumber?: number } = $props();

type StepVisual = "running" | "done" | "partial" | "skipped" | "crashed" | "upcoming";

let visual = $derived.by((): StepVisual => {
	if (step.endReason === "skipped") return "skipped";
	if (step.state === "started") return "running";
	if (step.state === "crashed" && step.endReason !== "ending") return "crashed";
	if (step.state === "partial") return "partial";
	if (["ended", "ending"].includes(step.state)) return "done";
	return "upcoming";
});

let showProgress = $derived(visual === "running" || visual === "crashed" || (visual === "skipped" && (step.progress ?? 0) > 0));
</script>

<div
    class={cn(
        "rounded-lg border p-4 transition-colors",
        visual === "running" && "border-indigo-400/60 bg-indigo-50/40 dark:border-indigo-400/40 dark:bg-indigo-500/5",
        visual === "done" && "border-border opacity-70",
        visual === "partial" && "border-amber-500/40",
        visual === "skipped" && "border-border opacity-70",
        visual === "crashed" && "border-red-500/50 bg-red-500/5",
        visual === "upcoming" && "border-border",
    )}
>
    <Flex items="center" gap={3}>
        <!-- Status disc -->
        <div
            class={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                visual === "running" && "bg-indigo-500/10 text-indigo-500 dark:text-indigo-300",
                visual === "done" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                visual === "partial" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                visual === "skipped" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                visual === "crashed" && "bg-red-500/10 text-red-600 dark:text-red-400",
                visual === "upcoming" && "bg-zinc-200/70 text-zinc-500 dark:bg-zinc-700/60 dark:text-zinc-400",
            )}
        >
            {#if visual === "running"}
                <Icon src={ArrowPath} class="h-4.5 w-4.5 animate-spin-slow" />
            {:else if visual === "done" || visual === "partial"}
                <Icon src={Check} theme="mini" class="h-4.5 w-4.5" />
            {:else if visual === "skipped"}
                <Icon src={ArrowDown} theme="mini" class="h-4.5 w-4.5" />
            {:else if visual === "crashed"}
                <Icon src={XMark} theme="mini" class="h-4.5 w-4.5" />
            {:else if stepNumber !== undefined}
                <span class="text-sm font-semibold tabular-nums">{stepNumber}</span>
            {/if}
        </div>

        <div class="min-w-0 grow">
            <h4 class={cn("leading-6", visual === "running" && "text-indigo-900 dark:text-indigo-100")}>
                {$_(`cycle.steps.${step.name}.name`)}
            </h4>
            <p class="text-sm text-zinc-500 dark:text-zinc-400">{$_(`cycle.steps.${step.name}.desc`)}</p>
        </div>

        <Flex gap={2} items="center" class="shrink-0">
            {#if step.runCount !== undefined && step.runAmount !== undefined && step.runAmount > 1 && !$page.data.machine_configuration.settings.hideMultilayerIndications}
                <span class="rounded-md bg-zinc-200/70 px-2 py-0.5 font-mono text-xs font-medium tabular-nums text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-300">
                    {step.runCount} / {step.runAmount}
                </span>
            {/if}

            {#if visual === "crashed"}
                <span class="rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                    {$_(`cycle.end_reasons.${step.endReason ?? 'error'}`)}
                </span>
            {/if}
        </Flex>
    </Flex>

    {#if showProgress}
        <div class="mt-3 pl-11">
            <ProgressBarGroup showProgressLabelForIndex={step.runCount} progresses={step.progresses} />
        </div>
    {/if}
</div>
