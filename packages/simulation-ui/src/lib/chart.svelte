<script lang="ts">
	import type { SimulationGate } from "../routes/+page.server";
	import Element from "./element.svelte";
	import { untrack } from "svelte";

	interface Props {
		gates: SimulationGate[];
	}

	let { gates }: Props = $props();

	type GateStore = Record<string, Array<SimulationGate>>;

	let history = $state.raw<GateStore>({});

	$effect(() => {
		void gates;

		untrack(() => {
			const next: GateStore = { ...history };
			for (const g of gates) {
				const prev = next[g.name] ?? [];
				const appended = [...prev, g];
				next[g.name] = appended.length > 50 ? appended.slice(-50) : appended;
			}
			history = next;
		});
	});

	const channels = $derived(
		Object.keys(history)
			.filter((k) => history[k].at(0)?.bus === "out")
			.sort(),
	);
</script>

{#if channels.length === 0}
	<p class="text-muted-foreground text-sm py-8 text-center">Waiting for activity…</p>
{:else}
	<div class="flex flex-col gap-2">
		{#each channels as g (g)}
			<Element gateHistory={history[g]} />
		{/each}
	</div>
{/if}
