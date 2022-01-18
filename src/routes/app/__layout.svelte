<script lang="ts">
	import '$lib/app.css';
	import HeadPage from '$lib/components/headPage.svelte';

	import PageTransition from '$lib/components/pageTransition.svelte';

	import { onMount } from 'svelte';

	let ready: boolean = false;

	import { machineData } from '$lib/utils/store';
	import type { IWSObject } from '$lib/utils/interfaces';
	import { fade, scale } from 'svelte/transition';

	onMount(() => {
		let ws = new WebSocket('ws://127.0.0.1/v1');

		ws.onmessage = (e: MessageEvent) => {
			setTimeout(() => {
				ready = true;
			}, 100);

			let data = JSON.parse(e.data) as IWSObject;

			$machineData = data;
		};
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
