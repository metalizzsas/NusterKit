<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';

	import { keyboardShown, keyboardHeight } from '$lib/utils/stores/keyboard';
	import Portal from 'svelte-portal';

	export let shown = false;
	
	export let title = '';
	export let displayClose: boolean | undefined = true;

	$: shown, document.body.classList.toggle('overflow-hidden', shown);
</script>

<Portal target="#modals">
	{#if shown}
		<div
			class="fixed top-0 right-0 left-0 backdrop-brightness-50 z-50"
			style={$keyboardShown ? `bottom: ${$keyboardHeight}px;` : 'bottom: 0px;'}
			in:fade={{ duration: 250 }}
			out:fade={{ duration: 250 }}
			on:click|self={() => (shown = false)}
		>
			<div
				class="relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5/6 md:w-2/3 xl:w-1/3 rounded-xl p-4 bg-neutral-50 dark:bg-neutral-700 shadow-xl group"
				in:fly={{ y: 300, duration: 250, easing: cubicInOut }}
				out:fly={{ y: 300, duration: 250, easing: cubicInOut }}
			>
				<div
					class="flex flex-row justify-between items-center border-b-[1px] border-neutral-300/25 pb-2 mb-3"
				>
				<div class="text-zinc-800 dark:text-zinc-50 font-semibold text-xl">
					<slot name="title" />
					{title}
				</div>
					{#if displayClose}
						<a
							href="#close"
							on:click|preventDefault={() => (shown = false)}
							class="font-semibold flex flex-row gap-2 items-center"
						>
							<svg
								id="glyphicons-basic"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 32 32"
								class="h-6 w-6 fill-red-400 rotate-45"
							>
								<path
									id="plus"
									d="M27,14v4a1,1,0,0,1-1,1H19v7a1,1,0,0,1-1,1H14a1,1,0,0,1-1-1V19H6a1,1,0,0,1-1-1V14a1,1,0,0,1,1-1h7V6a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v7h7A1,1,0,0,1,27,14Z"
								/>
							</svg>
						</a>
					{/if}
				</div>
				<div class="text-gray-900/75 dark:text-white overflow-y-scroll max-h-[50vh]">
					<slot />
				</div>
			</div>
		</div>
	{/if}
</Portal>
