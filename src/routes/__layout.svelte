<script lang="ts">
	import '@fontsource/montserrat';
	import '@fontsource/montserrat/400-italic.css';
	import '@fontsource/montserrat/500.css';
	import '@fontsource/montserrat/600.css';
	import '@fontsource/montserrat/700.css';

	import '$lib/app.css';

	import { beforeUpdate, onMount } from 'svelte';
	import { browser, dev } from '$app/env';
	import { waitLocale, init } from 'svelte-i18n';
	import { getLang } from '$lib/utils/settings';
	import { initi18nLocal } from '$lib/utils/i18n';
	import { BUNDLED } from '$lib/bundle';

	let ReloadPrompt: any;

	beforeUpdate(async () => {
		if (browser) {
			initi18nLocal();
			await waitLocale('en');
			await init({
				fallbackLocale: 'en',
				initialLocale: getLang(),
			});
		}
	});

	onMount(async () => {
		if (!dev && browser && BUNDLED != 'true') {
			ReloadPrompt = (await import('$lib/components/ReloadPrompt.svelte')).default;
		}
	});
</script>

<svelte:head>
	{#if !dev && browser && BUNDLED != 'true'}
		<link rel="manifest" href="/_app/manifest.webmanifest" />
	{/if}
</svelte:head>

<main class="p-4">
	<slot />
</main>

{#if ReloadPrompt}
	<svelte:component this={ReloadPrompt} />
{/if}
