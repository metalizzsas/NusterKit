<script lang="ts">
	import { browser } from '$app/env';

	import '$lib/app.css';
	import { _ } from 'svelte-i18n';
	import Modalcontent from './modalcontent.svelte';
	interface buttonOption {
		text: string;
		color: string;
		callback: Function;
		textColor?: string;
	}

	export let title: string;
	export let displayClose: boolean = true;
	export let message: string | undefined;
	export let buttons: buttonOption[] = [];

	export let shown: boolean = false;

	$: if (browser) document.body.classList.toggle('overflow-hidden', shown);
</script>

<Modalcontent bind:shown {title} {displayClose}>
	<div class="text-xl my-2 p-2 text-gray-900/75 dark:text-white">
		{message}
	</div>

	<div class="flex flex-row justify-end gap-4">
		{#each buttons as button}
			<a
				href="#close"
				on:click|preventDefault={() => {
					button.callback();
					shown = false;
				}}
				class="rounded-xl {button.color} text-white py-2 px-4 font-semibold"
			>
				{button.text}
			</a>
		{:else}
			<a
				href="#close"
				on:click|preventDefault={() => {
					shown = false;
				}}
				class="rounded-xl bg-emerald-500 text-white py-2 px-4 font-semibold"
			>
				{$_('ok')}
			</a>
		{/each}
	</div>
</Modalcontent>
