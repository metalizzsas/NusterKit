<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = () => {
		initi18nLocal(); // Load local translations jsons

		return {};
	};
</script>

<script lang="ts">
	import '@fontsource/montserrat';
	import '@fontsource/montserrat/400-italic.css';
	import '@fontsource/montserrat/500.css';
	import '@fontsource/montserrat/600.css';
	import '@fontsource/montserrat/700.css';

	import '$lib/app.css';

	import { locale } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { browser, dev } from '$app/env';
	import { BUNDLED } from '$lib/bundle';
	import { lang, dark, layoutSimplified } from '$lib/utils/settings';
	import { initi18nLocal } from '$lib/utils/i18nlocal';
	import Loadindicator from '$lib/components/loadindicator.svelte';

	let ReloadPrompt: any;

	onMount(async () => {
		if (!dev && browser && BUNDLED != 'true') {
			ReloadPrompt = (await import('$lib/components/ReloadPrompt.svelte')).default;
		}

		/**
		 * Theme store (Boolean)
		 */
		const storedDark = localStorage.getItem('theme') === 'dark';
		$dark = storedDark;

		dark.subscribe((value) => {
			localStorage.setItem('theme', value === true ? 'dark' : 'light');

			if (value === true) document.getElementsByTagName('html')[0].classList.add('dark');
			else document.getElementsByTagName('html')[0].classList.remove('dark');
		});

		/**
		 * Layout store (Boolean)
		 */
		const storedLayout = localStorage.getItem('simplified') === 'simplified';
		$layoutSimplified = storedLayout;

		layoutSimplified.subscribe((value) => {
			localStorage.setItem('simplified', value === true ? 'simplified' : 'classic');
		});

		/**
		 * Lang store
		 */
		const storedLang = localStorage.getItem('lang') ?? 'en';
		$lang = storedLang;

		lang.subscribe((value) => {
			localStorage.setItem('lang', value);
			$locale = value;
		});
	});
</script>

<svelte:head>
	{#if !dev && browser && BUNDLED != 'true'}
		<link rel="manifest" href="/_app/manifest.webmanifest" />
	{/if}
</svelte:head>

<Loadindicator />

<main class="p-4">
	<slot />
</main>

{#if ReloadPrompt}
	<svelte:component this={ReloadPrompt} />
{/if}
