<script lang="ts">
	import Button from './button.svelte';

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

	export let selectOptions: string[] | undefined;

	let value: string;

	export let shown: boolean = false;
</script>

{#if shown}
	<div class="absolute top-0 right-0 left-0 bottom-0 backdrop-blur-sm backdrop-brightness-50">
		<div
			class="relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-4 w-1/2 shadow-white"
		>
			<div id="modalHeader" class="flex flex-row justify-between items-center">
				<span class="font-semibold">{title}</span>
				{#if displayClose}
					<div
						class="bg-red-300 text-white p-2 rounded-full"
						on:click={() => (shown = false)}
					>
						X
					</div>
				{/if}
			</div>
			<div id="modalContent">
				{#if message}
					<p class="my-3">{message}</p>
				{/if}

				{#if selectOptions}
					<select name="selector" id="selectof" bind:value>
						{#each selectOptions as o}
							<option value={o}>{o}</option>
						{/each}
					</select>
					>
				{:else}
					<input
						type="text"
						bind:value
						class="rounded-full py-1 px-3 bg-black text-white my-3"
					/>
				{/if}

				<div class="grid grid-cols-3 gap-4 mt-3">
					{#each buttons as button}
						<button
							class="{button.color} rounded-full px-3 py-1 {button.textColor ||
								'text-white'} font-semibold"
							on:click={() => {
								button.callback(value);
								shown = false;
							}}
						>
							{button.text}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}
