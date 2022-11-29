<script lang="ts">
	import { _ } from 'svelte-i18n';
	import Button from '../button.svelte';
	import Modalcontent from './modal.svelte';
	import type { buttonOption } from './modalButtons';

	export let title: string | undefined;
	export let displayClose = true;
	export let buttons: buttonOption[] | [] = [];

	export let shown = false;

	$: shown, document.body.classList.toggle('overflow-hidden', shown);
</script>

<Modalcontent bind:shown {title} {displayClose}>
	<div class="py-2 text-gray-900/75 dark:text-white">
		<slot />
	</div>
	<div class="flex flex-row justify-end gap-4 border-t-[1px] border-neutral-300/25 pt-3 mt-2">
		{#each buttons as button}
			<Button
				color={button.color}
				on:click={async () => {
					if (button.callback) await button.callback();
					shown = false;
				}}
			>
				{button.text}
			</Button>
		{:else}
			<Button
				color={'bg-emerald-500'}
				on:click={() => {
					shown = false;
				}}
			>
				{$_('ok')}
			</Button>
		{/each}
	</div>
</Modalcontent>
