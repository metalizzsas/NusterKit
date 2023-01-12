<script lang="ts">
	import { page } from '$app/stores';

	import { _ } from 'svelte-i18n';

	const redirect = () => {
		window.location.href = '/';
	};
</script>

<main class="text-zinc-800 dark:text-white -m-4 rounded-xl p-6">
	<div class="h-screen w-screen flex flex-row justify-center">
		<div class="flex flex-row gap-8 items-center align-middle">
			<img
				src="/icons/icon-512.png"
				alt={$_('nuster.logo')}
				class="h-44 aspect-square rounded-xl ring-indigo-500 ring-[2px]"
			/>
			<div>
				<h1 class="text-xl">{$_('error.render.lead')}</h1>
				<h2 class="text-base">{$_('error.render.sub')}</h2>
				<p>{$page.status} - {$page.error?.message}</p>
				<button
					class="ring-[2px] ring-gray-800 dark:ring-white hover:ring-gray-600 bg-gray-400 transition-colors duration-500 font-bold rounded-xl py-2 px-8 mt-5 cursor-pointer"
					on:click={redirect}
				>
					{$_('error.render.button')}
				</button>
			</div>
		</div>
	</div>
</main>
