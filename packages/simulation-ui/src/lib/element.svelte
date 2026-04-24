<script lang="ts">
	import type { SimulationGate } from "../routes/+page.server";
	import { Badge } from "$lib/components/ui/badge";
	import { Card } from "$lib/components/ui/card";

	interface Props {
		gateHistory: SimulationGate[];
	}

	let { gateHistory }: Props = $props();

	const step = 24;
	const height = 56;
	const hi_y = 12;
	const lo_y = height - 12;

	const latest = $derived(gateHistory.at(-1));
	const is_bit = $derived(latest?.size === "bit");

	const analog_path = $derived.by(() => {
		if (is_bit || !latest) return "";
		const values = gateHistory.map((g) => g.value);
		const min = Math.min(...values);
		const max = Math.max(...values);
		const range = max - min || 1;
		return values
			.map((v, i) => {
				const x = i * step;
				const y = lo_y - ((v - min) / range) * (lo_y - hi_y);
				return `${i === 0 ? "M" : "L"} ${x} ${y}`;
			})
			.join(" ");
	});
</script>

<Card class="grid grid-cols-[200px_1fr_auto] items-stretch overflow-hidden py-0 gap-0">
	<div class="px-4 py-3 border-r flex flex-col justify-center gap-1">
		<div class="text-sm font-medium truncate" title={gateHistory[0].name}>
			{gateHistory[0].name}
		</div>
		<div class="flex items-center gap-2">
			<Badge variant="outline" class="text-[10px]">{latest?.bus}</Badge>
			<Badge variant="secondary" class="text-[10px]">{latest?.size}</Badge>
		</div>
	</div>

	<div class="relative overflow-hidden bg-muted/30">
		<svg
			viewBox="0 0 {Math.max(gateHistory.length * step, step * 50)} {height}"
			xmlns="http://www.w3.org/2000/svg"
			preserveAspectRatio="none"
			class="w-full h-full block"
		>
			<line
				x1="0"
				x2={Math.max(gateHistory.length * step, step * 50)}
				y1={height / 2}
				y2={height / 2}
				stroke="currentColor"
				stroke-opacity="0.15"
				stroke-dasharray="2 4"
			/>

			{#if is_bit}
				{#each gateHistory as gate, index (index)}
					{@const x = index * step}
					{@const y = gate.value > 0 ? hi_y : lo_y}
					<line x1={x} y1={y} x2={x + step} y2={y} stroke="currentColor" stroke-width="1.5" />
					{#if index > 0 && gateHistory[index - 1].value !== gate.value}
						<line x1={x} y1={hi_y} x2={x} y2={lo_y} stroke="currentColor" stroke-width="1.5" />
					{/if}
				{/each}
			{:else}
				<path d={analog_path} fill="none" stroke="currentColor" stroke-width="1.5" />
			{/if}
		</svg>
	</div>

	<div class="px-4 py-3 border-l flex flex-col justify-center items-end gap-1 min-w-[90px]">
		<span class="text-[10px] uppercase text-muted-foreground">Now</span>
		<span class="font-mono text-base font-semibold">
			{latest?.value ?? 0}
		</span>
	</div>
</Card>
