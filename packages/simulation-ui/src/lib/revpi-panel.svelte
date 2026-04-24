<script lang="ts">
	import type { SimulationGate } from "../routes/+page.server";
	import { Badge } from "$lib/components/ui/badge";
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { Separator } from "$lib/components/ui/separator";

	interface Props {
		gates?: SimulationGate[];
		devicePath?: string;
		bytes?: string;
	}

	let { gates = [], devicePath = "", bytes = "" }: Props = $props();

	const revpi_gates = $derived(gates.filter((g) => has_revpi_address(g)));

	function has_revpi_address(g: SimulationGate): boolean {
		return typeof g.address === "number" && (g.size === "bit" || g.size === "word" || g.size === "dword");
	}

	function byte_at(offset: number): number {
		if (!bytes || offset * 2 + 2 > bytes.length) return 0;
		return parseInt(bytes.slice(offset * 2, offset * 2 + 2), 16);
	}

	function hex(n: number, width = 2): string {
		return n.toString(16).padStart(width, "0").toUpperCase();
	}

	const mapped_byte_offsets = $derived(
		Array.from(
			new Set(
				revpi_gates.flatMap((g) => {
					const byte_offset = g.size === "bit" ? g.address >> 3 : g.address;
					const length = g.size === "bit" ? 1 : g.size === "word" ? 2 : 4;
					return Array.from({ length }, (_, i) => byte_offset + i);
				}),
			),
		).sort((a, b) => a - b),
	);

	const gate_by_byte = $derived.by(() => {
		const map = new Map<number, SimulationGate[]>();
		for (const g of revpi_gates) {
			const byte_offset = g.size === "bit" ? g.address >> 3 : g.address;
			const length = g.size === "bit" ? 1 : g.size === "word" ? 2 : 4;
			for (let i = 0; i < length; i++) {
				const off = byte_offset + i;
				if (!map.has(off)) map.set(off, []);
				map.get(off)!.push(g);
			}
		}
		return map;
	});
</script>

<div class="flex items-center gap-3 mb-4 flex-wrap">
	<span class="text-sm text-muted-foreground">Device</span>
	<code class="text-sm font-mono px-2 py-1 bg-muted rounded">
		{devicePath || "(not configured)"}
	</code>
	<div class="flex-1"></div>
	{#if revpi_gates.length === 0}
		<Badge variant="outline">No mapped gates</Badge>
	{:else}
		<Badge variant="secondary">{revpi_gates.length} gates</Badge>
		<Badge variant="outline">{mapped_byte_offsets.length} bytes used</Badge>
	{/if}
</div>

{#if mapped_byte_offsets.length > 0}
	<Card class="mb-4 py-4">
		<CardHeader>
			<CardTitle class="text-sm">Memory dump</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="overflow-x-auto">
				<div class="grid grid-cols-[auto_repeat(8,minmax(0,1fr))] gap-x-3 gap-y-1 text-xs font-mono min-w-[700px]">
					<div class="text-muted-foreground text-[10px]">Addr</div>
					{#each Array(8) as _, i (i)}
						<div class="text-muted-foreground text-[10px] text-center">+{i}</div>
					{/each}

					{#each mapped_byte_offsets.slice(0, 128) as offset, idx (offset)}
						{@const row_start = idx - (idx % 8)}
						{#if idx % 8 === 0}
							<div class="text-muted-foreground tabular-nums">0x{hex(mapped_byte_offsets[row_start], 4)}</div>
						{/if}
						{@const b = byte_at(offset)}
						{@const is_hot = b !== 0}
						{@const owners = gate_by_byte.get(offset) ?? []}
						<div
							class="tabular-nums text-center px-1 py-0.5 rounded"
							class:bg-primary={is_hot}
							class:text-primary-foreground={is_hot}
							class:text-muted-foreground={!is_hot}
							title={owners.map((g) => g.name).join(", ") || `byte ${offset}`}
						>
							{hex(b)}
						</div>
					{/each}
				</div>
			</div>
		</CardContent>
	</Card>

	<Card class="mb-4 py-4">
		<CardHeader>
			<CardTitle class="text-sm">Bit lanes</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
				{#each mapped_byte_offsets.slice(0, 8) as offset (offset)}
					{@const b = byte_at(offset)}
					<div class="flex items-center gap-3 border rounded-md px-3 py-2">
						<span class="text-xs text-muted-foreground font-mono shrink-0">
							0x{hex(offset, 4)}
						</span>
						<Separator orientation="vertical" class="h-6" />
						<div class="flex gap-1 flex-1">
							{#each Array(8) as _, bit (bit)}
								{@const is_set = ((b >> (7 - bit)) & 1) === 1}
								<div class="flex flex-col items-center gap-0.5 flex-1">
									<div
										class="size-6 border rounded flex items-center justify-center text-xs font-mono"
										class:bg-primary={is_set}
										class:text-primary-foreground={is_set}
										class:text-muted-foreground={!is_set}
									>
										{is_set ? "1" : "0"}
									</div>
									<span class="text-[10px] text-muted-foreground">.{7 - bit}</span>
								</div>
							{/each}
						</div>
						<span class="text-sm font-mono font-semibold shrink-0 w-10 text-right">
							{hex(b)}
						</span>
					</div>
				{/each}
			</div>
		</CardContent>
	</Card>
{/if}

{#if revpi_gates.length > 0}
	<Card class="py-4">
		<CardHeader>
			<CardTitle class="text-sm">Mapped gates</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
				{#each revpi_gates as gate (gate.name)}
					<div class="border rounded-md px-3 py-2 flex flex-col gap-1">
						<div class="flex items-center justify-between">
							<Badge variant={gate.bus === "in" ? "default" : "secondary"} class="text-[10px]">
								{gate.bus}
							</Badge>
							<span class="text-xs text-muted-foreground">{gate.size}</span>
						</div>
						<div class="text-sm font-medium truncate" title={gate.name}>
							{gate.name}
						</div>
						<div class="flex items-center justify-between text-xs">
							<span class="text-muted-foreground font-mono">
								{gate.size === "bit"
									? `${gate.address >> 3}.${gate.address & 7}`
									: `0x${hex(gate.address, 4)}`}
							</span>
							<span class="font-mono font-semibold">{gate.value ?? 0}</span>
						</div>
					</div>
				{/each}
			</div>
		</CardContent>
	</Card>
{/if}
