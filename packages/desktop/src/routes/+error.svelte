<script lang="ts">
	import { onMount } from 'svelte';

	import { _ } from 'svelte-i18n';

	let count = 0;

	let timeout = 10;

	onMount(() => {
		setTimeout(redirect, timeout * 1000);

		setInterval(() => {
			count = count + 1;
		}, 1000);
	});

	const redirect = () => {
		window.location.href = '/';
	};
</script>

<main class="text-zinc-800 dark:text-white -m-4">
	<div class="h-screen w-screen flex flex-row justify-center">
		<div class="flex flex-row gap-8 items-center align-middle">
			<img
				src="/icons/pwa-512.png"
				alt="Logo Nuster"
				class="h-44 aspect-square rounded-xl ring-indigo-500 ring-[2px]"
			/>
			<div>
				<h1 class="text-xl">{$_('renderError')}</h1>
				<h2 class="text-base">{$_('renderErrorSub')}</h2>
				<p>{$_('renderErrorRedirect')}</p>
				<button
					class="ring-[2px] ring-gray-800 dark:ring-white hover:ring-gray-600 bg-gray-400 bg-opacity-{count *
						timeout} transition-colors duration-500 font-bold rounded-xl py-2 px-8 mt-5 cursor-pointer"
					on:click={redirect}
				>
					{$_('renderErrorRedirectButton')} ({timeout - count} s)
				</button>
			</div>
		</div>
	</div>
</main>
