<script lang="ts">
	import '@fontsource/montserrat';
	import '$lib/app.css';
	import kbDisplay from '$lib/json/kb.json';
	import HeadPage from '$lib/components/headpage.svelte';

	import PageTransition from '$lib/components/pagetransition.svelte';

	import { afterUpdate, onMount } from 'svelte';

	//@ts-ignore
	import KioskBoard from 'kioskboard';

	let ready: boolean = false;

	import { machineData } from '$lib/utils/store';
	import type { IWSObject } from '$lib/utils/interfaces';
	import { fade, scale } from 'svelte/transition';

	onMount(() => {
		// Initialize KioskBoard (default/all options)

		KioskBoard.init({
			/*!
			 * Required
			 * An Array of Objects has to be defined for the custom keys. Hint: Each object creates a row element (HTML) on the keyboard.
			 * e.g. [{"key":"value"}, {"key":"value"}] => [{"0":"A","1":"B","2":"C"}, {"0":"D","1":"E","2":"F"}]
			 */
			keysArrayOfObjects: kbDisplay,

			/*!
			 * Required only if "keysArrayOfObjects" is "null".
			 * The path of the "kioskboard-keys-${langugage}.json" file must be set to the "keysJsonUrl" option. (XMLHttpRequest to get the keys from JSON file.)
			 * e.g. '/Content/Plugins/KioskBoard/dist/kioskboard-keys-english.json'
			 */
			keysJsonUrl: null,

			/*
			 * Optional: An Array of Strings can be set to override the built-in special characters.
			 * e.g. ["#", "$", "%", "+", "-", "*"]
			 */
			keysSpecialCharsArrayOfStrings: null,

			/*
			 * Optional: An Array of Numbers can be set to override the built-in numpad keys. (From 0 to 9, in any order.)
			 * e.g. [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
			 */
			keysNumpadArrayOfNumbers: null,

			// Optional: (Other Options)

			// Language Code (ISO 639-1) for custom keys (for language support) => e.g. "de" || "en" || "fr" || "hu" || "tr" etc...
			language: 'en',

			// The theme of keyboard => "light" || "dark" || "flat" || "material" || "oldschool"
			theme: 'flat',

			// Uppercase or lowercase to start. Uppercased when "true"
			capsLockActive: false,

			/*
			 * Allow or prevent real/physical keyboard usage. Prevented when "false"
			 * In addition, the "allowMobileKeyboard" option must be "true" as well, if the real/physical keyboard has wanted to be used.
			 */
			allowRealKeyboard: true,

			// Allow or prevent mobile keyboard usage. Prevented when "false"
			allowMobileKeyboard: false,

			// CSS animations for opening or closing the keyboard
			cssAnimations: true,

			// CSS animations duration as millisecond
			cssAnimationsDuration: 150,

			// CSS animations style for opening or closing the keyboard => "slide" || "fade"
			cssAnimationsStyle: 'slide',

			// Allow or deny Spacebar on the keyboard. The Spacebar will be passive when "false"
			keysAllowSpacebar: true,

			// Text of the space key (Spacebar). Without text => " "
			keysSpacebarText: 'Space',

			// Font family of the keys
			keysFontFamily: 'sans-serif',

			// Font size of the keys
			keysFontSize: '22px',

			// Font weight of the keys
			keysFontWeight: 'normal',

			// Size of the icon keys
			keysIconSize: '25px',

			// Scrolls the document to the top of the input/textarea element. Prevented when "false"
			autoScroll: true,
		});
		let ws = new WebSocket('ws://127.0.0.1/v1');

		ws.onmessage = (e: MessageEvent) => {
			setTimeout(() => {
				ready = true;
			}, 100);

			let data = JSON.parse(e.data) as IWSObject;

			$machineData = data;
		};
	});

	afterUpdate(() => {
		//reload keyboard only if some dom elements with jsvk are found
		if (document.querySelectorAll('.jsvk').length > 0) KioskBoard.run('.jsvk');
	});
</script>

<div>
	{#if ready}
		<div>
			<!-- <PageTransition> -->
			<HeadPage />
			<slot />
			<!-- </PageTransition> -->
		</div>
	{:else}
		<div class="absolute top-0 bottom-0 right-0 left-0" in:fade out:fade>
			<div
				class="bg-zinc-700 w-1/2 p-10 mx-auto text-white rounded-3xl translate-y-1/2"
				in:scale
				out:scale
			>
				<div class="flex flex-row">
					<svg
						id="glyphicons-basic"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 32 32"
						class="fill-white animate-spin-ease"
					>
						<path
							id="reload"
							d="M19.87274,10.13794l1.31787-1.48267A8.92382,8.92382,0,0,0,14.93652,7.063,9.0169,9.0169,0,0,0,7.509,19.0083a8.88913,8.88913,0,0,0,5.76245,5.57849,9.01793,9.01793,0,0,0,10.66144-4.34558.9883.9883,0,0,1,1.252-.43762l.9262.38513a1.00842,1.00842,0,0,1,.50147,1.40161A11.99311,11.99311,0,1,1,23.1991,6.39575L24.584,4.83765a.49992.49992,0,0,1,.8595.214l1.47235,6.05273a.5.5,0,0,1-.5462.6145L20.186,10.96643A.5.5,0,0,1,19.87274,10.13794Z"
						/>
					</svg>

					<div class="flex flex-col">
						<h1>Loading...</h1>
						<p>Please wait while the application loads.</p>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
