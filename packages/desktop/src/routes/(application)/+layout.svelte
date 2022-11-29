<script lang="ts">
	import { _ } from 'svelte-i18n';

	import { beforeUpdate, onDestroy, onMount } from 'svelte';

	import { lockMachineData, machineData } from '$lib/utils/stores/store';
	import { fade, scale } from 'svelte/transition';

	import { BUNDLED } from '$lib/utils/bundle';
	import Flex from '$lib/components/layout/flex.svelte';
	import Popup from '$lib/components/modals/popup.svelte';
	import Navstack from '$lib/components/navigation/navstack/navstack.svelte';
	import { initI18nMachine } from '$lib/utils/i18n/i18nmachine';
	import { Linker } from '$lib/utils/stores/linker';
	import type {
		IPopupMessage,
		IStatusMessage,
		IWebSocketData,
	} from '@metalizzsas/nuster-typings';

	let websocketState: 'closed' | 'connected' | 'connecting' = 'connecting';
	let ws: WebSocket | undefined;

	let displayPopup = false;
	let popupData: IPopupMessage | null = null;

	beforeUpdate(() => {
		const ip = window.localStorage.getItem('ip') ?? '127.0.0.1';
		$Linker = ip;
	});

	onMount(() => {
		//disabling right click if Bundled
		if (BUNDLED == 'true') window.addEventListener('contextmenu', (e) => e.preventDefault());

		void connectWebSocket();
	});

	onDestroy(() => {
		ws?.close();
	});

	/**
	 * Handle websocket Messages events
	 * @param message Message given by the websocket server
	 */
	const handleWebsocketData = (message: MessageEvent) => {
		let data = JSON.parse(message.data as string) as IWebSocketData;

		switch (data.type) {
			case 'status': {
				if ($lockMachineData === false) {
					$machineData = data.message as IStatusMessage;
				}
				websocketState = 'connected';
				break;
			}
			case 'popup': {
				displayPopup = true;
				popupData = data.message as IPopupMessage;
				break;
			}
		}
	};

	/** Connect to the websocket server */
	const connectWebSocket = () => {
		const protocol = window.location.protocol == 'https:' ? 'wss' : 'ws';

		ws = new WebSocket(`${protocol}://${$Linker}/ws/`);

		//Handle events triggered by websocket
		ws.addEventListener('error', () => {
			websocketState = 'closed';
		});
		ws.addEventListener('close', () => {
			websocketState = 'closed';
		});
		ws.addEventListener('message', handleWebsocketData);
		ws.addEventListener('open', () => {
			void initI18nMachine($Linker);
		});

		//Timeout for connection
		setTimeout(() => {
			if (ws !== undefined && ws.readyState != WebSocket.OPEN) ws?.close();
		}, 10000);
	};
</script>

{#if ['connecting', 'closed'].includes(websocketState)}
	<div class="fixed flex inset-0 justify-center items-center" in:fade out:fade>
		<div class="relative w-1/4" in:scale out:scale>
			<Flex direction="col" gap={4}>
				<div class="bg-zinc-900 rounded-3xl p-5">
					{#if websocketState != 'closed'}
						<svg
							id="glyphicons-basic"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 32 32"
							class="fill-white animate-spin-ease w-full aspect-square"
						>
							<path
								id="reload"
								d="M19.87274,10.13794l1.31787-1.48267A8.92382,8.92382,0,0,0,14.93652,7.063,9.0169,9.0169,0,0,0,7.509,19.0083a8.88913,8.88913,0,0,0,5.76245,5.57849,9.01793,9.01793,0,0,0,10.66144-4.34558.9883.9883,0,0,1,1.252-.43762l.9262.38513a1.00842,1.00842,0,0,1,.50147,1.40161A11.99311,11.99311,0,1,1,23.1991,6.39575L24.584,4.83765a.49992.49992,0,0,1,.8595.214l1.47235,6.05273a.5.5,0,0,1-.5462.6145L20.186,10.96643A.5.5,0,0,1,19.87274,10.13794Z"
							/>
						</svg>
					{:else}
						<svg
							id="glyphicons-basic"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 32 32"
							class="fill-red-400 rotate-45 w-full aspect-square"
						>
							<path
								id="plus"
								d="M27,14v4a1,1,0,0,1-1,1H19v7a1,1,0,0,1-1,1H14a1,1,0,0,1-1-1V19H6a1,1,0,0,1-1-1V14a1,1,0,0,1,1-1h7V6a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v7h7A1,1,0,0,1,27,14Z"
							/>
						</svg>
					{/if}
				</div>
				{#if (websocketState != 'connected' && BUNDLED != 'true') || websocketState == 'closed'}
					<div class="bg-zinc-900 rounded-3xl p-5">
						<Flex direction={'col'} gap={4}>
							{#if websocketState != 'closed'}
								{#if BUNDLED != 'true'}
									<a
										class="py-1 px-3 bg-red-400 text-white rounded-xl font-semibold text-center"
										data-sveltekit-reload
										href="/"
									>
										{$_('cancel')}
									</a>
								{/if}
							{:else}
								<p class="text-red-500 font-semibold text-center">
									{$_('loadingScreen.connectionError').replace('#ip', $Linker)}
								</p>
								<a
									class="bg-gray-500 text-white font-semibold py-1 px-2 rounded-xl text-center"
									data-sveltekit-reload
									href={BUNDLED != 'true' ? '/' : '/app'}
								>
									{$_(`loadingScreen.${BUNDLED != 'true' ? 'return' : 'retry'}`)}
								</a>
							{/if}
						</Flex>
					</div>
				{/if}
			</Flex>
		</div>
	</div>
{:else}
	<Popup bind:shown={displayPopup} modalData={popupData} />

	<Navstack>
		<slot />
	</Navstack>
{/if}
