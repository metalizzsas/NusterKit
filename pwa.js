import { resolveConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa';
import { pwaConfiguration } from './pwa-configuration.js';
import { copyFileSync } from 'fs';
import { resolve } from 'path';

const webmanifestDestinations = [
	'./.svelte-kit/output/client/',
	'./build/_app/',
	'./build/'
]

const swDestinations = [
	'./build/',
]

const buildPwa = async() => {
	const config = await resolveConfig({ plugins: [VitePWA({ ...pwaConfiguration })] }, 'build', 'production' )
	// when `vite-plugin-pwa` is present, use it to regenerate SW after rendering
	const pwaPlugin = config.plugins.find(i => i.name === 'vite-plugin-pwa')?.api
	if (pwaPlugin?.generateSW) {
		console.log('Generating PWA...')
		await pwaPlugin.generateSW()
		webmanifestDestinations.forEach(d => {
			copyFileSync(resolve('.svelte-kit', 'output', 'client', '_app', 'immutable', 'manifest.webmanifest'), resolve(d, 'manifest.webmanifest'))
			//copyFileSync('./.svelte-kit/output/client/_app/immuable/manifest.webmanifest', `${d}manifest.webmanifest`)
		})
		// don't copy workbox, SvelteKit will copy it
		swDestinations.forEach(d => {
			copyFileSync(resolve('.svelte-kit', 'output', 'client', 'sw.js'), resolve(d, 'sw.js'))
		});
		console.log('Generation of PWA complete')
	}
} 

buildPwa()