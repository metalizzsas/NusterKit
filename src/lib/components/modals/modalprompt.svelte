<script lang="ts">
	import Inputkb from '../inputkb.svelte';
	import { browser } from '$app/env';
	import Modalcontent from './modalcontent.svelte';

	interface buttonOption {
		text: string;
		color: string;
		callback(val: string): void;
		textColor?: string;
	}

	export let title: string;
	export let displayClose: boolean = true;
	export let message: string | undefined;
	export let buttons: buttonOption[] = [];

	export let selectOptions: string[] | undefined = undefined;

	let val = '';

	let selectval = '';

	export let shown: boolean = false;

	$: if (browser) document.body.classList.toggle('overflow-hidden', shown);
</script>

<Modalcontent bind:shown {title} {displayClose}>
	<div id="modalContent">
		{#if message}
			<p class="my-3 dark:text-white text-gray-800">{message}</p>
		{/if}

		{#if selectOptions}
			<select name="selector" id="selectof" bind:value={selectval}>
				{#each selectOptions as o}
					<option value={o}>{o}</option>
				{/each}
			</select>
			>
		{:else}
			<Inputkb
				bind:value={val}
				options={{
					class: 'rounded-xl py-2 px-3 ring-1 ring-gray-500/50 text-zinc-700 mb-3 mt-1',
				}}
			/>
		{/if}

		<div class="grid grid-cols-3 gap-4 mt-3">
			{#each buttons as button}
				<button
					class="{button.color} rounded-xl px-3 py-1 {button.textColor ||
						'text-white'} font-semibold"
					on:click={() => {
						console.log('value', val);
						button.callback(selectOptions ? selectval : val);
						shown = false;
					}}
				>
					{button.text}
				</button>
			{/each}
		</div>
	</div>
</Modalcontent>
