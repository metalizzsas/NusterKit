<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import Chart from "$lib/chart.svelte";
	import Gate from "$lib/gate.svelte";
	import { Badge } from "$lib/components/ui/badge";
	import { Separator } from "$lib/components/ui/separator";
	import { onMount } from "svelte";
	import type { PageData } from "./$types";

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	onMount(() => {
		let in_flight = false;
		const poll_interval = setInterval(async () => {
			if (in_flight) return;
			in_flight = true;
			try {
				await invalidateAll();
			} finally {
				in_flight = false;
			}
		}, 300);
		return () => clearInterval(poll_interval);
	});

	const inputs = $derived(data.gates.filter((g) => g.bus === "in"));
	const outputs = $derived(data.gates.filter((g) => g.bus === "out"));
</script>

<header class="border-b sticky top-0 z-40 bg-background/95 backdrop-blur">
	<div class="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold leading-none">Simulator</h1>
			<p class="text-sm text-muted-foreground mt-1">Click inputs to change them, watch outputs respond</p>
		</div>
		<Badge variant={data.connected ? "default" : "destructive"} class="text-sm px-3 py-1.5">
			{data.connected ? "● Connected" : "● Disconnected"}
		</Badge>
	</div>
</header>

<main class="mx-auto max-w-7xl px-6 py-8 space-y-10">
	<section>
		<div class="flex items-baseline justify-between mb-5">
			<div>
				<h2 class="text-xl font-bold">Inputs</h2>
				<p class="text-sm text-muted-foreground mt-0.5">You control these</p>
			</div>
			<Badge variant="secondary">{inputs.length}</Badge>
		</div>
		{#if inputs.length === 0}
			<p class="text-muted-foreground py-8 text-center">No inputs</p>
		{:else}
			<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
				{#each inputs as gate (gate.name)}
					<Gate {gate} />
				{/each}
			</div>
		{/if}
	</section>

	<Separator />

	<section>
		<div class="flex items-baseline justify-between mb-5">
			<div>
				<h2 class="text-xl font-bold">Outputs</h2>
				<p class="text-sm text-muted-foreground mt-0.5">The machine controls these</p>
			</div>
			<Badge variant="secondary">{outputs.length}</Badge>
		</div>
		{#if outputs.length === 0}
			<p class="text-muted-foreground py-8 text-center">No outputs</p>
		{:else}
			<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
				{#each outputs as gate (gate.name)}
					<Gate {gate} />
				{/each}
			</div>
		{/if}
	</section>

	<Separator />

	<section>
		<div class="mb-5">
			<h2 class="text-xl font-bold">Activity</h2>
			<p class="text-sm text-muted-foreground mt-0.5">Recent values over time</p>
		</div>
		<Chart gates={data.gates} />
	</section>
</main>
