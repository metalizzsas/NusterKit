import sveltePreprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-node';

/** @type {import("@sveltejs/kit").Config} */
const config = {
	kit: {
		adapter: adapter({out: "./build"}),
		target: '#svelte'
	},
	preprocess: sveltePreprocess(),
};
export default config;