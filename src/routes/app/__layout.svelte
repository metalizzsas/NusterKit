<script context="module" lang="ts">
	import { waitLocale, _ } from 'svelte-i18n';
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async (ctx) => {
		const content = await ctx.fetch('/app/getip').then((r) => r.json());

		await waitLocale();
		return { props: { ip: content.ip } };
	};
</script>

<script lang="ts">
	import { initI18n } from '$lib/utils/i18n';

	import HeadPage from '$lib/components/headpage.svelte';
	import Pagetransition from '$lib/components/pagetransition.svelte';

	import { beforeUpdate, onDestroy, onMount } from 'svelte';

	import { machineData } from '$lib/utils/store';
	import type { IWSObject } from '$lib/utils/interfaces';
	import { fade, scale } from 'svelte/transition';
	import { loadDarkMode } from '$lib/utils/settings';

	import { Linker } from '$lib/utils/linker';
	import { goto } from '$app/navigation';
	import Modal from '$lib/components/modals/modal.svelte';

	let ready: boolean = false;

	let ws: WebSocket;
	let wsAtempt: number = 0;
	let wsError: boolean = false;

	let displayModal: boolean = false;
	let displayModalMessage: string = '';

	export let ip: string;

	beforeUpdate(() => {
		$Linker = ip;
	});

	onMount(async () => {
		await initI18n(ip);
		loadDarkMode();

		//disabling right click
		window.addEventListener('contextmenu', function (e) {
			e.preventDefault();
		});

		registerWebsocket();
	});
	onDestroy(() => {
		if (ws) ws.close();
	});

	async function registerWebsocket() {
		for (let i = 1; i < 12; i++) {
			wsAtempt = i;

			if (wsAtempt === 11) {
				wsError = true;
				break;
			}

			ws = new WebSocket('ws://' + $Linker + '/v1');

			const result = await new Promise<boolean>((resolve) => {
				ws.onopen = () => {
					resolve(true);
				};
				ws.onerror = () => {
					resolve(false);
				};
			});

			if (result === true) {
				break;
			} else {
				await new Promise((resolve) => setTimeout(resolve, 1000));
				ws.close();
				continue;
			}
		}
		ws.onmessage = (e: MessageEvent) => {
			interface WSContent {
				type: string;
				message: IWSObject | string;
			}

			let data = JSON.parse(e.data) as WSContent;

			if (data.type == 'status') {
				$machineData = data.message as IWSObject;
				ready = true;
			} else {
				if (data.type == 'message') {
					displayModal = true;
					displayModalMessage = data.message as string;
				}
			}
		};
		ws.onclose = (e: Event) => {
			ready = false;
			wsAtempt = 0;
			registerWebsocket();
		};
	}
</script>

<div>
	{#if !ready}
		<div
			class="fixed flex top-0 bottom-0 left-0 right-0 justify-center items-center"
			in:fade
			out:fade
		>
			<div
				class="relative bg-zinc-900 w-[35%] p-10 text-white rounded-3xl"
				in:scale
				out:scale
			>
				<div class="flex flex-col">
					{#if wsError === false}
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
						<p class="text-center">Login attempt {wsAtempt} / 10</p>
					{:else}
						<svg
							id="glyphicons-basic"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 32 32"
							class="fill-red-400 rotate-45"
						>
							<path
								id="plus"
								d="M27,14v4a1,1,0,0,1-1,1H19v7a1,1,0,0,1-1,1H14a1,1,0,0,1-1-1V19H6a1,1,0,0,1-1-1V14a1,1,0,0,1,1-1h7V6a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v7h7A1,1,0,0,1,27,14Z"
							/>
						</svg>

						<p class="text-red-500 font-semibold text-center">
							Connection Error {$Linker} is unreachable
							{#if ip !== '127.0.0.1'}
								<button
									class="bg-gray-500 text-white font-semibold py-1 px-2 rounded-xl"
									on:click={() => goto('/')}
								>
									Return to NusterDesktop
								</button>
							{:else}
								<button
									class="bg-gray-500 text-white font-semibold py-1 px-2 rounded-xl"
									on:click={() => (window.location.href = '/machine')}
								>
									Retry
								</button>
							{/if}
						</p>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<div>
			<Modal
				bind:shown={displayModal}
				title={$_('message.modal.title')}
				message={$_('message.modal.' + displayModalMessage)}
			/>
			<Pagetransition>
				<HeadPage />
				<slot />
			</Pagetransition>
		</div>
	{/if}
</div>
