<script lang="ts">
	import '@fontsource/montserrat';
	import '@fontsource/montserrat/400-italic.css';
	import '@fontsource/montserrat/500.css';
	import '@fontsource/montserrat/600.css';
	import '@fontsource/montserrat/700.css';

	import '$lib/app.css';

	import { locale } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { lang, dark, layoutSimplified } from '$lib/utils/stores/settings';
	import { initi18nLocal } from '$lib/utils/i18n/i18nlocal';
	import Loadindicator from '$lib/components/loadindicator.svelte';

	export const ssr = false;

	onMount(() => {

		initi18nLocal();

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

<Loadindicator />

<main class="p-4">
	<slot />
</main>
