<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import Chart from "$lib/chart.svelte";
	import Gate from "$lib/gate.svelte";
	import RevpiPanel from "$lib/revpi-panel.svelte";
	import { Switch } from "$lib/components/ui/switch";
	import { Badge } from "$lib/components/ui/badge";
	import { Label } from "$lib/components/ui/label";
	import { Separator } from "$lib/components/ui/separator";
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription,
		CardAction,
	} from "$lib/components/ui/card";
	import { onMount } from "svelte";
	import type { PageData } from "./$types";

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let show_gates_editable = $state(true);

	onMount(() => {
		const poll_interval = setInterval(() => invalidateAll(), 250);
		return () => clearInterval(poll_interval);
	});

	const in_count = $derived(data.gates.filter((g) => g.bus === "in").length);
	const out_count = $derived(data.gates.filter((g) => g.bus === "out").length);
	const visible_gates = $derived(
		data.gates.filter((k) => (show_gates_editable ? k.bus === "in" : true)),
	);
</script>

<header class="border-b bg-background sticky top-0 z-40">
	<div class="mx-auto max-w-[1600px] px-6 py-4 flex items-center gap-4">
		<div class="flex items-baseline gap-2">
			<span class="text-lg font-semibold">Nuster Sim</span>
			<span class="text-muted-foreground text-sm">IO Inspector</span>
		</div>
		<div class="flex-1"></div>
		<div class="flex items-center gap-2">
			<Badge variant={data.connected ? "default" : "destructive"}>
				{data.connected ? "Connected" : "Disconnected"}
			</Badge>
			<Badge variant="secondary">{data.gates.length} gates</Badge>
			<Badge variant="outline">In {in_count}</Badge>
			<Badge variant="outline">Out {out_count}</Badge>
			{#if data.revpi}
				<Badge variant="secondary">RevPi attached</Badge>
			{/if}
		</div>
	</div>
</header>

<main class="mx-auto max-w-[1600px] px-6 py-6 space-y-6">
	<Card>
		<CardHeader>
			<CardTitle>IO Gates</CardTitle>
			<CardDescription>
				Showing {visible_gates.length} of {data.gates.length} gates
			</CardDescription>
			<CardAction>
				<div class="flex items-center gap-2">
					<Label for="editable-only">Editable only</Label>
					<Switch id="editable-only" bind:checked={show_gates_editable} />
				</div>
			</CardAction>
		</CardHeader>
		<CardContent>
			{#if visible_gates.length === 0}
				<p class="text-muted-foreground text-sm py-8 text-center">No gates in scope</p>
			{:else}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
					{#each visible_gates as gate (gate.name)}
						<Gate {gate} />
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>

	{#if data.revpi}
		<Card>
			<CardHeader>
				<CardTitle>RevolutionPi</CardTitle>
				<CardDescription>Process image · 4096 bytes</CardDescription>
			</CardHeader>
			<CardContent>
				<RevpiPanel gates={data.gates} devicePath={data.revpi.devicePath} bytes={data.revpi.bytes} />
			</CardContent>
		</Card>
	{/if}

	<Card>
		<CardHeader>
			<CardTitle>Chronogram</CardTitle>
			<CardDescription>Trace buffer · 50 samples</CardDescription>
		</CardHeader>
		<CardContent>
			<Chart gates={data.gates} />
		</CardContent>
	</Card>

	<Separator />
	<footer class="pb-6 text-xs text-muted-foreground text-center">
		Metalizz · Nuster Kit
	</footer>
</main>
