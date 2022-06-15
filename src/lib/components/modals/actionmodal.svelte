<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { browser } from '$app/env';
	import Portal from 'svelte-portal';

	export let shown: boolean;

	$: if (browser) document.body.classList.toggle('overflow-hidden', shown);
</script>

<Portal target="body">
	{#if shown}
		<div
			class="fixed top-0 right-0 left-0 bottom-0 backdrop-brightness-50 z-50"
			in:fade={{ duration: 250 }}
			out:fade={{ duration: 250 }}
			on:click|self={() => (shown = false)}
		>
			<div
				class="relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] md:w-2/3 xl:w-1/3 rounded-xl p-2 bg-neutral-50 dark:bg-neutral-700 text-zinc-700 dark:text-zinc-100 shadow-xl group"
				in:fly={{ y: 300, duration: 250, easing: cubicInOut }}
				out:fly={{ y: 300, duration: 250, easing: cubicInOut }}
			>
				<div
					class="bg-neutral-300 dark:bg-neutral-400 h-1.5 rounded-full w-[10%] mx-auto"
				/>
				<div class="p-2 overflow-scroll max-h-[80vh]">
					<slot />
				</div>
			</div>
		</div>
	{/if}
</Portal>
