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

	let ReloadPrompt: any;

	beforeUpdate(async () => {
		initi18nLocal();
		await waitLocale('en');
		await init({
			fallbackLocale: 'en',
			initialLocale: getLang(),
		});
	});

	onMount(async () => {
		!dev &&
			browser &&
			(ReloadPrompt = (await import('$lib/components/ReloadPrompt.svelte')).default);
	});
</script>

<svelte:head>
	{#if !dev && browser}
		<link rel="manifest" href="/_app/manifest.webmanifest" />
	{/if}
</svelte:head>

<main>
	<slot />
</main>

{#if ReloadPrompt}
	<svelte:component this={ReloadPrompt} />
{/if}
