<script lang="ts">
	import type { SimulationGate } from "../routes/+page.server";
	import { invalidateAll } from "$app/navigation";
	import { Slider } from "$lib/components/ui/slider";
	import { cn } from "$lib/utils";

	interface Props {
		gate: SimulationGate;
	}

	let { gate }: Props = $props();

	function map(source: number, in_min: number, in_max: number, out_min: number, out_max: number) {
		return ((source - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
	}

	const mapped_value = $derived(
		gate.type === "mapped"
			? map(gate.value, gate.mapInMin ?? 0, gate.mapInMax ?? 32767, gate.mapOutMin, gate.mapOutMax)
			: 0,
	);

	const is_on = $derived(gate.size === "bit" && gate.value === 1);
	const editable = $derived(gate.bus === "in");

	async function update_value(value: number) {
		await fetch("/api/io", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ gate: gate.name, value }),
		});
		await invalidateAll();
	}

	function toggle() {
		if (gate.size === "bit" && editable) update_value(is_on ? 0 : 1);
	}
</script>

{#if gate.size === "bit"}
	<button
		type="button"
		onclick={toggle}
		disabled={!editable}
		class={cn(
			"group relative flex flex-col gap-3 w-full min-h-[130px] rounded-xl border-2 p-5 text-left transition-all",
			is_on
				? "border-primary bg-primary/15"
				: "border-border bg-card",
			editable && "cursor-pointer hover:border-primary/70 active:scale-[0.98]",
			!editable && "cursor-default",
		)}
	>
		<div class="flex items-center gap-2">
			<div
				class={cn(
					"size-3 rounded-full transition-colors",
					is_on ? "bg-primary" : "bg-muted-foreground/40",
				)}
			></div>
			<span class="text-xs font-mono text-muted-foreground">@{gate.address}</span>
		</div>

		<div class="text-base font-semibold leading-tight break-words" title={gate.name}>
			{gate.name}
		</div>

		<div class="mt-auto flex items-baseline justify-between">
			<span
				class={cn(
					"text-2xl font-bold tabular-nums",
					is_on ? "text-primary" : "text-muted-foreground",
				)}
			>
				{is_on ? "ON" : "OFF"}
			</span>
			{#if editable}
				<span class="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
					tap to toggle
				</span>
			{/if}
		</div>
	</button>
{:else if gate.type === "mapped" || gate.type === "pt100"}
	{@const value = gate.type === "pt100" ? gate.value / 10 : mapped_value}
	{@const min = gate.type === "pt100" ? 0 : gate.mapOutMin}
	{@const max = gate.type === "pt100" ? 100 : gate.mapOutMax}
	{@const unit = gate.type === "pt100" ? "°C" : (gate.unity ?? "")}
	<div class="flex flex-col gap-3 w-full min-h-[130px] rounded-xl border-2 border-border bg-card p-5">
		<div class="flex items-center gap-2">
			<div class="size-3 rounded-full bg-primary"></div>
			<span class="text-xs font-mono text-muted-foreground">@{gate.address}</span>
		</div>

		<div class="text-sm font-semibold leading-tight break-words" title={gate.name}>
			{gate.name}
		</div>

		<div class="flex items-baseline gap-2">
			<span class="text-3xl font-bold tabular-nums">{value.toFixed(1)}</span>
			{#if unit}
				<span class="text-sm text-muted-foreground">{unit}</span>
			{/if}
		</div>

		{#if editable}
			<div class="mt-auto space-y-1">
				<Slider
					type="single"
					value={value}
					{min}
					{max}
					step={0.1}
					onValueCommit={(v) => update_value(gate.type === "pt100" ? v * 10 : v)}
				/>
				<div class="flex justify-between text-xs text-muted-foreground">
					<span>{min}</span>
					<span>{max}</span>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div class="flex flex-col gap-3 w-full min-h-[130px] rounded-xl border-2 border-border bg-card p-5">
		<div class="flex items-center gap-2">
			<div class="size-3 rounded-full bg-muted-foreground/40"></div>
			<span class="text-xs font-mono text-muted-foreground">@{gate.address}</span>
		</div>

		<div class="text-sm font-semibold leading-tight break-words" title={gate.name}>
			{gate.name}
		</div>

		<div class="mt-auto flex items-baseline gap-2">
			<span class="text-3xl font-bold tabular-nums">{gate.value}</span>
			{#if gate.unity}
				<span class="text-sm text-muted-foreground">{gate.unity}</span>
			{/if}
		</div>
	</div>
{/if}
