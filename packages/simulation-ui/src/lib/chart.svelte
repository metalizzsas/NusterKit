<script lang="ts">
	import type { SimulationGate } from "../routes/+page.server";
	import Element from "./element.svelte";
	import { Switch } from "$lib/components/ui/switch";
	import { Label } from "$lib/components/ui/label";

	interface Props {
		gates: SimulationGate[];
	}

	let { gates }: Props = $props();

	type GateStore = Record<string, Array<SimulationGate>>;

	const history_dates: Date[] = [];
	const history_data: GateStore = {};
	let tick = $state(0);
	let hide_inputs = $state(true);

	$effect(() => {
		void gates;

		history_dates.push(new Date());

		for (const g of gates) {
			if (history_data[g.name] === undefined) history_data[g.name] = [];
			history_data[g.name] = [...history_data[g.name], g];
		}

		if (history_dates.length > 50) {
			history_dates.shift();
			for (const key in history_data) {
				history_data[key] = history_data[key].slice(1);
			}
		}

		tick++;
	});

	const channel_keys = $derived.by(() => {
		void tick;
		return Object.keys(history_data).filter(
			(k) => (hide_inputs ? history_data[k].at(0)?.bus != "in" : true),
		);
	});

	const sample_count = $derived.by(() => {
		void tick;
		return history_dates.length;
	});
</script>

<div class="flex items-center justify-between gap-3 mb-4">
	<div class="flex items-center gap-2">
		<Label for="hide-inputs">Hide inputs</Label>
		<Switch id="hide-inputs" bind:checked={hide_inputs} />
	</div>
	<span class="text-xs text-muted-foreground">
		{channel_keys.length} channels · {sample_count}/50 samples
	</span>
</div>

{#if channel_keys.length === 0}
	<p class="text-muted-foreground text-sm py-8 text-center">
		No channels. Toggle "Hide inputs" off to view input traces.
	</p>
{:else}
	{#key tick}
		<div class="flex flex-col gap-2">
			{#each channel_keys as g (g)}
				<Element gateHistory={history_data[g]} />
			{/each}
		</div>
	{/key}
{/if}
