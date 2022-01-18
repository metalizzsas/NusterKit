<script lang="ts">
	import '$lib/app.css';
	import { fade } from 'svelte/transition';
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
</script>

{#if shown}
	<div
		class="absolute top-0 right-0 left-0 bottom-0 backdrop-blur-sm backdrop-brightness-50 z-50"
		in:fade={{ duration: 100 }}
		out:fade={{ duration: 100 }}
	>
		<div
			class="relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5/6 rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-50 dark:bg-neutral-800 shadow-xl group"
		>
			<div class="flex flex-row gap-5 justify-items-end -translate-y-4">
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

			<div class="text-xl my-2 p-2 text-gray-900/75">
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
				{/each}
			</div>
		</div>
	</div>
{/if}
