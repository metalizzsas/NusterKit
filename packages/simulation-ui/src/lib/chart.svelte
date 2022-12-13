<script lang="ts">
	import type { IOGates } from '@metalizzsas/nuster-typings/build/spec/iogates';

	import { afterUpdate } from 'svelte';
	import Element from './element.svelte';

	export let gates: IOGates[];

	type gateStore = Record<string, Array<IOGates>>;

	let history: [Array<Date>, gateStore] = [[], {}];

	let hideInputs = true;

	const stringToColour = (str: string) => {
		var hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
		}
		var colour = '#';
		for (let i = 0; i < 3; i++) {
			var value = (hash >> (i * 8)) & 0xff;
			colour += ('00' + value.toString(16)).substr(-2);
		}
		return colour;
	};

	afterUpdate(() => {
		history[0].push(new Date());

		for (const g of gates) {
			if (history[1][g.name] === undefined) history[1][g.name] = [];

			history[1][g.name] = [...history[1][g.name], g];
		}

		if (history[0].length > 50) {
			history[0].splice(0, 1);
			for (const key in history[1]) {
				history[1][key].splice(0, 1);
			}
		}
	});
</script>

<div style="margin: 0.5em 0;">Hide Inputs <input type="checkbox" bind:checked={hideInputs} /></div>

<div style="display: flex; flex-direction: column; gap:0.25em;">
	{#each Object.keys(history[1]).filter( (k) => (hideInputs ? history[1][k].at(0)?.bus != 'in' : true) ) as g}
		<Element bind:gateHistory={history[1][g]} />
	{/each}
</div>
