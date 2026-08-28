<script lang="ts">
import { _ } from "svelte-i18n";
import { page } from "$app/stores";
import Gate from "$lib/components/io/Gate.svelte";
import type { IOGateJSON } from "$lib/types/turbine";
import { realtime } from "$lib/utils/stores/nuster";

let gates = $derived($realtime.io.filter((i) => i.bus === $page.params.bus));

// Regroupées par catégorie — celle que la gate porte déjà, dérivée de son nom
// (`met#plv-high` → `met`). Sur cet écran des libellés voisins ne diffèrent que
// d'un mot (« Pulvérisation métallisation haute / millieu / bas »), et sur le
// tactile c'est ce qui fait actionner la mauvaise ligne : un titre de section
// donne à l'œil le repère qui manquait. L'ordre suit celui du spec.
let groups = $derived.by(() => {
	const by_category = new Map<string, IOGateJSON[]>();

	for (const gate of gates) {
		const existing = by_category.get(gate.category);
		if (existing !== undefined) existing.push(gate);
		else by_category.set(gate.category, [gate]);
	}

	return [...by_category];
});

// Une seule catégorie ne mérite pas de titre : il ne séparerait rien.
let show_headings = $derived(groups.length > 1);
</script>

{#each groups as [category, group] (category)}
	<section>
		{#if show_headings}
			<h2 class="pb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
				{$_(`gates.categories.${category}`)}
			</h2>
		{/if}

		<div class="divide-y divide-border">
			{#each group as gate (gate.name)}
				<!-- 56px : l'interrupteur en fait 24, ce qui laisse une zone morte
				     de part et d'autre pour que deux lignes voisines ne se touchent pas. -->
				<div class="flex min-h-14 items-center">
					<Gate io={gate} editable={gate.bus === "out"} />
				</div>
			{/each}
		</div>
	</section>
{/each}
