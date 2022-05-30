import sveltePreprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
import { VitePWA } from 'vite-plugin-pwa';
import { pwaConfiguration } from './pwa-configuration.js'

/** @type {import("@sveltejs/kit").Config} */
export default {
	kit: {
		adapter: adapter({
			fallback: 'index.html'
		}),
		vite: {
			plugins: [
				VitePWA(pwaConfiguration)
			]
		}
	},
	preprocess: sveltePreprocess(),
};