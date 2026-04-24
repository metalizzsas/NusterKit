<script lang="ts">
	import type { SimulationGate } from "../routes/+page.server";
	import { enhance } from "$app/forms";
	import { Switch } from "$lib/components/ui/switch";
	import { Slider } from "$lib/components/ui/slider";
	import { Badge } from "$lib/components/ui/badge";
	import { Label } from "$lib/components/ui/label";
	import { Card, CardContent } from "$lib/components/ui/card";

	interface Props {
		gate: SimulationGate;
	}

	let { gate }: Props = $props();

	let submit_button: HTMLButtonElement | undefined = $state();
	let form_el: HTMLFormElement | undefined = $state();
	let hidden_value: HTMLInputElement | undefined = $state();
	let hidden_checked: HTMLInputElement | undefined = $state();

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
	const switch_id = $derived(`gate-${gate.name}`);

	function on_bit_toggle(checked: boolean) {
		if (!hidden_checked || !submit_button) return;
		hidden_checked.value = checked ? "on" : "";
		submit_button.click();
	}

	function on_slider_change(value: number) {
		if (!hidden_value || !submit_button) return;
		hidden_value.value = String(value);
		submit_button.click();
	}
</script>

<Card class="py-4">
	<CardContent class="px-4 space-y-3">
		<form bind:this={form_el} action="?/updateGateValue" method="post" use:enhance class="space-y-3">
			<div class="flex items-center justify-between gap-2">
				<Badge variant={gate.bus === "in" ? "default" : "secondary"}>
					{gate.bus === "in" ? "In" : "Out"}
				</Badge>
				<span class="text-xs text-muted-foreground font-mono">
					{gate.size} @ {gate.address}
				</span>
			</div>

			<div class="text-sm font-medium truncate" title={gate.name}>
				{gate.name}
			</div>

			<input type="hidden" name="gate" value={gate.name} />
			{#if gate.size === "bit"}
				<input type="hidden" name="value_checked" bind:this={hidden_checked} />
			{:else}
				<input type="hidden" name="value" bind:this={hidden_value} />
			{/if}
			<button type="submit" bind:this={submit_button} aria-label="submit" class="sr-only"></button>

			<div class="pt-2 border-t">
				{#if gate.size === "bit"}
					<div class="flex items-center justify-between gap-3">
						<span class="text-sm font-mono">{gate.value === 1 ? "HIGH" : "LOW"}</span>
						{#if editable}
							<Switch id={switch_id} checked={is_on} onCheckedChange={on_bit_toggle} />
						{:else}
							<Badge variant="outline">readback</Badge>
						{/if}
					</div>
				{:else if gate.type === "mapped"}
					<div class="space-y-2">
						<div class="flex items-baseline justify-between">
							<Label class="text-xs text-muted-foreground">{gate.unity ?? "value"}</Label>
							<span class="font-mono text-sm font-semibold">{mapped_value.toFixed(1)}</span>
						</div>
						{#if editable}
							<Slider
								type="single"
								value={mapped_value}
								min={gate.mapOutMin}
								max={gate.mapOutMax}
								step={0.1}
								onValueChange={on_slider_change}
							/>
						{/if}
					</div>
				{:else if gate.type === "pt100"}
					<div class="space-y-2">
						<div class="flex items-baseline justify-between">
							<Label class="text-xs text-muted-foreground">°C</Label>
							<span class="font-mono text-sm font-semibold">{(gate.value / 10).toFixed(1)}</span>
						</div>
						{#if editable}
							<Slider
								type="single"
								value={gate.value / 10}
								min={0}
								max={100}
								step={0.1}
								onValueChange={on_slider_change}
							/>
						{/if}
					</div>
				{:else}
					<div class="flex items-baseline justify-between">
						<span class="font-mono text-sm font-semibold">{gate.value}</span>
						<span class="text-xs text-muted-foreground">{gate.unity ?? "raw"}</span>
					</div>
				{/if}
			</div>
		</form>
	</CardContent>
</Card>
