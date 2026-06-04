<script lang="ts">
import { ArrowPath, Check, Clock, ExclamationTriangle, Pause } from "@steeze-ui/heroicons";
import { Icon } from "@steeze-ui/svelte-icon";
import { _ } from "svelte-i18n";
import type { PBRStepHydrated, ProgramBlockRunnerHydrated } from "$lib/types/turbine";
import { cn } from "$lib/utils/cn.js";
import { parseDurationToString } from "$lib/utils/dateparser";
import { translateProfileName } from "$lib/utils/i18n/i18nprofile";

let { cycleData }: { cycleData: ProgramBlockRunnerHydrated } = $props();

let now = $state(Date.now());
$effect(() => {
	const id = setInterval(() => (now = Date.now()), 500);
	return () => clearInterval(id);
});

let isPaused = $derived(cycleData.status.mode === "paused");

let elapsed = $derived.by(() => {
	if (!cycleData.status.startDate) return 0;
	return Math.max(0, (now - cycleData.status.startDate) / 1000);
});

let totalEstimated = $derived.by(() => {
	if (!cycleData.status.estimatedRunTime) return null;
	return cycleData.status.estimatedRunTime + (cycleData.status.overallPausedTime ?? 0);
});

let remaining = $derived.by(() => {
	if (totalEstimated === null) return null;
	return Math.max(0, totalEstimated - elapsed);
});

let overallProgress = $derived.by(() => {
	if (totalEstimated === null) return null;
	return Math.max(0, Math.min(1, elapsed / totalEstimated));
});

let enabledSteps = $derived(cycleData.steps.filter((s) => s.isEnabled));

let currentStep = $derived(enabledSteps[cycleData.currentStepIndex] ?? enabledSteps.find((s) => s.state === "started"));

const stepStateClass = (step: PBRStepHydrated, isCurrent: boolean) => {
	if (step.endReason === "skipped") return "bg-zinc-300 dark:bg-zinc-600 text-zinc-500";
	if (step.state === "crashed" && step.endReason !== "ending") return "bg-red-500 text-white";
	if (step.state === "ended" || step.state === "ending") return "bg-emerald-500 text-white";
	if (isCurrent || step.state === "started") return isPaused ? "bg-amber-500 text-white" : "bg-indigo-500 text-white";
	return "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400";
};

const totalStepsDuration = $derived(enabledSteps.reduce((sum, s) => sum + Math.max(s.duration ?? 60, 10), 0));

const stepWidth = (step: PBRStepHydrated) => {
	const d = Math.max(step.duration ?? 60, 10);
	return `${(d / totalStepsDuration) * 100}%`;
};
</script>

<div
	class="rounded-lg border border-border bg-gradient-to-br from-white to-indigo-50/30 p-4 dark:from-zinc-800 dark:to-zinc-900"
>
	<div class="flex items-start justify-between gap-6">
		<div class="min-w-0 flex-1">
			<p class="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
				{$_(`cycle.names.${cycleData.name}`)}
			</p>
			{#if cycleData.profile}
				<h1 class="truncate text-2xl font-bold leading-tight text-zinc-900 dark:text-white">
					{translateProfileName($_, cycleData.profile)}
				</h1>
			{/if}
			{#if currentStep}
				<div class="mt-2 flex items-center gap-2 text-sm">
					{#if isPaused}
						<Icon src={Pause} theme="solid" class="h-4 w-4 text-amber-500" />
						<span class="font-semibold text-amber-600 dark:text-amber-400">
							{$_("cycle.paused")}
						</span>
						<span class="text-zinc-500">·</span>
					{:else}
						<Icon src={ArrowPath} class="h-4 w-4 animate-spin-slow text-indigo-500" />
					{/if}
					<span class="text-zinc-700 dark:text-zinc-200">
						{$_(`cycle.steps.${currentStep.name}.name`)}
					</span>
				</div>
			{/if}
		</div>

		<!-- Hero counters -->
		<div class="flex shrink-0 gap-6 text-right">
			<div>
				<p class="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
					{$_("cycle.eta.elapsed")}
				</p>
				<p class="font-mono text-2xl font-semibold tabular-nums text-zinc-900 dark:text-white">
					{parseDurationToString(elapsed)}
				</p>
			</div>
			{#if remaining !== null}
				<div>
					<p class="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
						{$_("cycle.eta.remaining")}
					</p>
					<p
						class={cn(
							"font-mono text-2xl font-semibold tabular-nums",
							isPaused ? "text-amber-600 dark:text-amber-400" : "text-indigo-600 dark:text-indigo-400",
						)}
					>
						{parseDurationToString(remaining)}
					</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- Progress bar -->
	{#if overallProgress !== null}
		<div class="mt-4">
			<div class="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
				<div
					class={cn(
						"h-full rounded-full transition-all duration-500",
						isPaused ? "bg-amber-500" : "bg-indigo-500",
					)}
					style:width={`${overallProgress * 100}%`}
				></div>
			</div>
			<div class="mt-1 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
				<span>0%</span>
				<span class="font-mono tabular-nums">{Math.floor(overallProgress * 100)}%</span>
				<span>100%</span>
			</div>
		</div>
	{/if}

	<!-- Step timeline -->
	<div class="mt-6">
		<div class="flex h-10 w-full overflow-hidden rounded-md">
			{#each enabledSteps as step, i (step.name + i)}
				{@const isCurrent = step === currentStep}
				<div
					class={cn(
						"relative flex items-center justify-center border-r border-white/40 px-2 transition-all duration-300 last:border-r-0 dark:border-zinc-900/40",
						stepStateClass(step, isCurrent),
						isCurrent && !isPaused && "shadow-[inset_0_0_0_2px_rgba(255,255,255,0.4)]",
					)}
					style:width={stepWidth(step)}
					title={$_(`cycle.steps.${step.name}.name`)}
				>
					{#if isCurrent && step.progress !== null}
						<div
							class="absolute inset-y-0 left-0 bg-white/20 transition-all duration-500"
							style:width={`${(step.progress ?? 0) * 100}%`}
						></div>
					{/if}
					<span class="relative z-10 truncate text-[11px] font-medium uppercase tracking-wider">
						{#if step.state === "ended" || step.state === "ending"}
							<Icon src={Check} theme="solid" class="h-4 w-4" />
						{:else if step.state === "crashed" && step.endReason !== "ending"}
							<Icon src={ExclamationTriangle} theme="solid" class="h-4 w-4" />
						{:else if isCurrent}
							<Icon src={Clock} class="h-4 w-4" />
						{/if}
					</span>
				</div>
			{/each}
		</div>
		<div class="mt-2 flex w-full">
			{#each enabledSteps as step, i (step.name + i + "-label")}
				{@const isCurrent = step === currentStep}
				<div
					class={cn(
						"truncate px-1 text-[10px]",
						isCurrent
							? "font-semibold text-zinc-900 dark:text-white"
							: "text-zinc-500 dark:text-zinc-400",
					)}
					style:width={stepWidth(step)}
				>
					{$_(`cycle.steps.${step.name}.name`)}
				</div>
			{/each}
		</div>
	</div>
</div>
