<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { Minus, Plus } from '@steeze-ui/heroicons';
	import Keyboard from '../Keyboard.svelte';

	type TimeUnit = 'hours' | 'minutes' | 'seconds' | 'milliseconds';

	let {
		disabled = false,
		value = $bindable(),
		enabledTimes = undefined,
	}: {
		disabled?: boolean;
		value: number;
		enabledTimes?: TimeUnit[];
	} = $props();

	let milliseconds = $state(0);
	let seconds = $state(0);
	let minutes = $state(0);
	let hours = $state(0);

	let focusedUnit: TimeUnit | undefined = $state(undefined);

	const computeTo = () => {
		value = milliseconds / 1000 + seconds + minutes * 60 + hours * 3600;
	}

	const computeFrom = () => {
		hours = Math.floor(value / 3600);
		minutes = Math.floor((value - hours * 3600) / 60);
		seconds = Math.floor(value - minutes * 60 - hours * 3600);

		var msInter = value - Math.floor(value);
		milliseconds = Math.ceil(Math.floor(msInter * 10000) / 10);
	};

	onMount(() => {
		computeFrom();
		computeTo();
	});

	$effect(() => {
		void value;
		computeFrom();
	});

	const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

	/** Per-unit display config: short label, bounds and stepper increment. */
	const units: Record<TimeUnit, { label: string; min: number; max: number; step: number }> = {
		hours: { label: "h", min: 0, max: 23, step: 1 },
		minutes: { label: "min", min: 0, max: 59, step: 1 },
		seconds: { label: "s", min: 0, max: 59, step: 1 },
		milliseconds: { label: "ms", min: 0, max: 990, step: 10 },
	};

	const get_unit = (unit: TimeUnit) =>
		unit === "hours" ? hours : unit === "minutes" ? minutes : unit === "seconds" ? seconds : milliseconds;

	const set_unit = (unit: TimeUnit, v: number) => {
		const next = clamp(Number.isFinite(v) ? v : 0, units[unit].min, units[unit].max);
		if (unit === "hours") hours = next;
		else if (unit === "minutes") minutes = next;
		else if (unit === "seconds") seconds = next;
		else milliseconds = next;
		computeTo();
	};

	const step_unit = (unit: TimeUnit, direction: 1 | -1) => {
		if (disabled) return;
		set_unit(unit, get_unit(unit) + units[unit].step * direction);
	};

	let shownUnits = $derived(
		(["hours", "minutes", "seconds", "milliseconds"] as TimeUnit[]).filter((u) =>
			enabledTimes === undefined ? u === "minutes" || u === "seconds" : enabledTimes.includes(u),
		),
	);

	const stepButtonClass =
		"grid h-11 w-10 shrink-0 place-items-center text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-white/5 dark:hover:text-zinc-200";
</script>

<div class="flex flex-wrap items-center gap-2">
	{#each shownUnits as unit (unit)}
		<div class="flex items-stretch overflow-hidden rounded-lg border border-border bg-white shadow-xs dark:bg-zinc-800">
			{#if !disabled}
				<button type="button" {disabled} class={stepButtonClass} aria-label="-1 {unit}" onclick={() => step_unit(unit, -1)}>
					<Icon src={Minus} theme="mini" class="h-4 w-4" />
				</button>
			{/if}

			<label class="flex w-14 flex-col items-center justify-center gap-0 px-1 py-1">
				<input
					type="number"
					inputmode="numeric"
					{disabled}
					min={units[unit].min}
					max={units[unit].max}
					value={get_unit(unit)}
					onfocus={() => { if (!disabled) focusedUnit = unit; }}
					oninput={(e) => set_unit(unit, e.currentTarget.valueAsNumber)}
					class="w-full bg-transparent text-center text-base font-semibold tabular-nums text-foreground outline-none disabled:opacity-60"
				/>
				<span class="text-[10px] font-medium uppercase leading-none tracking-wide text-zinc-400 dark:text-zinc-500">
					{units[unit].label}
				</span>
			</label>

			{#if !disabled}
				<button type="button" {disabled} class={stepButtonClass} aria-label="+1 {unit}" onclick={() => step_unit(unit, 1)}>
					<Icon src={Plus} theme="mini" class="h-4 w-4" />
				</button>
			{/if}
		</div>
	{/each}
</div>

{#each shownUnits as unit (unit)}
	{#if focusedUnit === unit && $page.data.is_machine_screen}
		{#if unit === "hours"}
			<Keyboard bind:value={hours} onclose={() => { focusedUnit = undefined; set_unit("hours", hours); }} />
		{:else if unit === "minutes"}
			<Keyboard bind:value={minutes} onclose={() => { focusedUnit = undefined; set_unit("minutes", minutes); }} />
		{:else if unit === "seconds"}
			<Keyboard bind:value={seconds} onclose={() => { focusedUnit = undefined; set_unit("seconds", seconds); }} />
		{:else}
			<Keyboard bind:value={milliseconds} onclose={() => { focusedUnit = undefined; set_unit("milliseconds", milliseconds); }} />
		{/if}
	{/if}
{/each}
