<script lang="ts">
	import { _ } from 'svelte-i18n';

	import type { IPopupMessage, IStatusMessage, IWebSocketData } from 'webSocketData/index';

	import { beforeUpdate, onDestroy, onMount } from 'svelte';

	import { lockMachineData, machineData } from '$lib/utils/stores/store';
	import type { INusterPopup, IWSObject } from '$lib/utils/interfaces';
	import { fade, scale } from 'svelte/transition';

	import { Linker } from '$lib/utils/stores/linker';
	import { goto } from '$app/navigation';
	import Navstack from '$lib/components/navigation/navstack.svelte';
	import { BUNDLED } from '$lib/bundle';
	import { initI18nMachine } from '$lib/utils/i18n/i18nmachine';
	import Popup from '$lib/components/modals/popup.svelte';

	let ready: boolean = false;

	let ws: WebSocket;
	let wsAtempt: number = 0;
	let wsError: boolean = false;

	let displayPopup: boolean = false;
	let popupData: INusterPopup | null = null;

	beforeUpdate(async () => {
		const ip = window.localStorage.getItem('ip') ?? '127.0.0.1';
		$Linker = ip;
	});

	onMount(async () => {
		//disabling right click
		window.addEventListener('contextmenu', function (e) {
			if (BUNDLED == 'true') e.preventDefault();
		});

		registerWebsocket();
	});

	onDestroy(() => {
		if (ws) {
			ws.onclose = null;
			ws.onmessage = null;
			ws.close();
		}
	});

	async function registerWebsocket() {
		for (let i = 1; i < 12; i++) {
			wsAtempt = i;

			if (wsAtempt === 11) {
				wsError = true;
				break;
			}

			const protocol = window.location.protocol == 'https:' ? 'wss' : 'ws';

			ws = new WebSocket(protocol + '://' + $Linker + '/ws/');

			const result = await new Promise<boolean>((resolve) => {
				ws.onopen = () => {
					resolve(true);
				};
				ws.onerror = () => {
					resolve(false);
				};
			});

			if (result === true) {
				await initI18nMachine($Linker);
				break;
			} else {
				await new Promise((resolve) => setTimeout(resolve, 5000));
				ws.close();
				continue;
			}
		}
		ws.onmessage = (e: MessageEvent) => {
			let data = JSON.parse(e.data) as IWebSocketData;

			switch (data.type) {
				case 'status': {
					if ($lockMachineData === false) {
						$machineData = data.message as IStatusMessage;
						ready = true;
					}
					break;
				}
				case 'popup': {
					displayPopup = true;
					popupData = data.message as IPopupMessage;
					break;
				}
			}
		};

		ws.onerror = (e: Event) => {
			console.log('WS Error');
		};

		ws.onclose = (e: Event) => {
			ready = false;
			wsAtempt = 0;
			registerWebsocket();
		};
	}
</script>

{#if !ready}
	<div
		class="fixed flex top-0 bottom-0 left-0 right-0 justify-center items-center"
		in:fade
		out:fade
	>
		<div class="relative bg-zinc-900 w-[35%] p-5 text-white rounded-3xl" in:scale out:scale>
			<div class="flex flex-col gap-2">
				{#if wsError === false}
					<svg
						id="glyphicons-basic"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 32 32"
						class="fill-white animate-spin-ease w-1/3 aspect-square self-center"
					>
						<path
							id="reload"
							d="M19.87274,10.13794l1.31787-1.48267A8.92382,8.92382,0,0,0,14.93652,7.063,9.0169,9.0169,0,0,0,7.509,19.0083a8.88913,8.88913,0,0,0,5.76245,5.57849,9.01793,9.01793,0,0,0,10.66144-4.34558.9883.9883,0,0,1,1.252-.43762l.9262.38513a1.00842,1.00842,0,0,1,.50147,1.40161A11.99311,11.99311,0,1,1,23.1991,6.39575L24.584,4.83765a.49992.49992,0,0,1,.8595.214l1.47235,6.05273a.5.5,0,0,1-.5462.6145L20.186,10.96643A.5.5,0,0,1,19.87274,10.13794Z"
						/>
					</svg>
					<p class="text-center">
						{$_('loadingScreen.connectionAttemptCount')}
						{wsAtempt} / 10
					</p>
					<button
						class="py-1 px-3 bg-red-400 text-white rounded-xl font-semibold"
						on:click={() => history.back()}
					>
						{$_('cancel')}
					</button>
				{:else}
					<svg
						id="glyphicons-basic"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 32 32"
						class="fill-red-400 rotate-45 w-1/3 aspect-square self-center"
					>
						<path
							id="plus"
							d="M27,14v4a1,1,0,0,1-1,1H19v7a1,1,0,0,1-1,1H14a1,1,0,0,1-1-1V19H6a1,1,0,0,1-1-1V14a1,1,0,0,1,1-1h7V6a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v7h7A1,1,0,0,1,27,14Z"
						/>
					</svg>

					<p class="text-red-500 font-semibold text-center">
						{$_('loadingScreen.connectionError').replace('#ip', $Linker)}
						{#if BUNDLED != 'true'}
							<button
								class="bg-gray-500 text-white font-semibold py-1 px-2 rounded-xl"
								on:click={() => goto('/')}
							>
								{$_('loadingScreen.return')}
							</button>
						{:else}
							<button
								class="bg-gray-500 text-white font-semibold py-1 px-2 rounded-xl"
								on:click={() => goto('/app')}
							>
								{$_('loadingScreen.retry')}
							</button>
						{/if}
					</p>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<Popup bind:shown={displayPopup} modalData={popupData} />

	<Navstack>
		<slot />
	</Navstack>
{/if}
