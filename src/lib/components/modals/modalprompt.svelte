<script lang="ts">
	import { validate_each_argument } from 'svelte/internal';

	import { fade } from 'svelte/transition';
	import Inputkb from '../inputkb.svelte';

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
</script>

{#if shown}
	<div
		class="fixed top-0 bottom-0 left-0 right-0 bg-gray-600 z-50"
		in:fade={{ duration: 50 }}
		out:fade={{ duration: 50 }}
	>
		<div class="flex flex-row h-screen items-center justify-around ">
			<div class="bg-neutral-50 dark:bg-neutral-800 p-3 w-5/6 rounded-xl shadow-xl group">
				<div class="flex flex-row gap-5 justify-items-end -translate-y-6">
					{#if displayClose}
						<a
							href="#close"
							on:click|preventDefault={() => (shown = false)}
							class="rounded-xl bg-red-400 text-white py-1 px-1 font-semibold flex flex-row gap-2 items-center"
						>
							<svg
								id="glyphicons-basic"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 32 32"
								class="h-5 w-5 fill-white rotate-45"
							>
								<path
									id="plus"
									d="M27,14v4a1,1,0,0,1-1,1H19v7a1,1,0,0,1-1,1H14a1,1,0,0,1-1-1V19H6a1,1,0,0,1-1-1V14a1,1,0,0,1,1-1h7V6a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v7h7A1,1,0,0,1,27,14Z"
								/>
							</svg>
						</a>
					{/if}
					<div
						class="rounded-xl bg-gray-500 text-white py-1 px-8 font-semibold shadow-md group-hover:scale-105 transition-all"
					>
						{title}
					</div>
				</div>

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
			</div>
		</div>
	</div>
{/if}
