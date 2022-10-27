<script lang="ts">
	import Inputkb from '$lib/components/userInputs/inputkb.svelte';
	import Modalcontent from './modalcontent.svelte';

	interface buttonOption {
		text: string;
		color: string;
		/** If callback return true, the modal is not closed */
		callback?: (val: string) => boolean | void | Promise<boolean | void>;
		textColor?: string;
	}

	export let title: string;
	export let displayClose = true;
	export let buttons: buttonOption[] = [];

	export let selectOptions: string[] | undefined = undefined;

	export let placeholder: string | undefined = undefined;

	let val = '';
	let selectval = '';

	export let shown = false;

	const handleCallback = async (callback: buttonOption["callback"]) => {

		if(callback instanceof Promise)
		{
			const result = await callback(selectOptions ? selectval : val);

			if(result != false)
				shown = false;
		}
		else if(callback !== undefined)
		{
			const result = callback(selectOptions ? selectval : val);

			if(result != false)
				shown = false;
		}

	}

	$: shown, document.body.classList.toggle('overflow-hidden', shown);
</script>

<Modalcontent bind:shown {title} {displayClose}>
	<div id="modalContent" class="flex flex-col gap-2">
		<slot />

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
					class: 'rounded-xl py-2 px-3 ring-1 bg-neutral-100 text-zinc-800 dark:bg-neutral-600 dark:text-white ring-gray-500/50  mb-3 mt-1 my-2 w-1/2',
					placeholder,
				}}
			/>
		{/if}

		<div class="flex flex-row justify-end gap-4 border-t-[1px] border-neutral-300/25 pt-2">
			{#each buttons as button}
				<button
					class="{button.color} rounded-xl px-4 py-2 {button.textColor ||
						'text-white'} font-semibold"
					on:click={() => handleCallback(button.callback)}
				>
					{button.text}
				</button>
			{/each}
		</div>
	</div>
</Modalcontent>
