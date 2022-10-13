<script lang="ts">
	import {
		navActions,
		navBackFunction,
		navExpandBottom,
		navTitle,
		useNavContainer,
	} from '$lib/utils/stores/navstack';

	import { _, date, time } from 'svelte-i18n';
	import { page } from '$app/stores';
	import { BUNDLED } from '$lib/bundle';
	import { machineData } from '$lib/utils/stores/store';

	import Navcontainer from './navcontainer.svelte';
	import Button from '../button.svelte';
	import Flex from '../layout/flex.svelte';
	import Informations from './indexStackContent/informations.svelte';
	import Updates from './indexStackContent/updates.svelte';
	import Settings from './indexStackContent/settings.svelte';
	import Label from '$lib/components/label.svelte';
	import { onDestroy, onMount } from 'svelte';
	import Network from './indexStackContent/network.svelte';

	let shownModal: 'settings' | 'info' | 'updates' | 'network' | null = null;

	$: displaySettings = shownModal == 'settings';
	$: displayInfo = shownModal == 'info';
	$: displayNetworkInfo = shownModal == 'network';
	$: displayUpdateScreen = shownModal == 'updates';

	//circular inference
	//$: shownModal = (displayInfo || displayNetworkInfo || displaySettings || displayUpdateScreen) ? shownModal : '';

	$: index = $page.url.pathname == '/app';

	let dateNow = 0;
	let dateInterval: ReturnType<typeof setTimeout>;

	onMount(() => {
		dateInterval = setInterval(() => {
			dateNow = Date.now();
		}, 1000);
	});

	onDestroy(() => {
		if (dateInterval) clearInterval(dateInterval);
	});
</script>

<Settings bind:shown={displaySettings} />
<Informations bind:shown={displayInfo} />
<Updates bind:shown={displayUpdateScreen} />
<Network bind:shown={displayNetworkInfo} />

<div
	class="bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl ring-[0.5px] ring-indigo-300/50 mb-6 text-white"
>
	<Flex gap={6} align="middle" items="center" class="{index ? 'p-4' : 'p-2'} overflow-hidden">
		{#if !index}
			<div
				class="flex flex-row gap-1 items-center align-middle cursor-pointer"
				on:click={() => {
					if ($navBackFunction) void $navBackFunction();
					else history.back();
				}}
			>
				<svg
					id="glyphicons-basic"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 32 32"
					class="h-6 w-6 fill-rose-400 animate-bounce-x ml-2"
				>
					<path
						id="arrow-thin-left"
						d="M28,15v2a1,1,0,0,1-1,1H11.82861L15.475,21.64648a.49983.49983,0,0,1,0,.707L13.35358,24.4751a.5.5,0,0,1-.70716,0L4.87848,16.707a.99986.99986,0,0,1,0-1.41406L12.64642,7.5249a.5.5,0,0,1,.70716,0L15.475,9.64648a.49983.49983,0,0,1,0,.707L11.82861,14H27A1,1,0,0,1,28,15Z"
					/>
				</svg>
				<span class="font-semibold text-sm text-white hidden sm:block">
					{$_('back')}
				</span>
			</div>
		{:else}
			<a
				href={(BUNDLED == 'true' ? '/app' : '/')}
				class="flex flex-rox gap-4 items-center hover:bg-white rounded-md hover:text-zinc-700 text-white transition-all duration-500 cursor-pointer"
			>
				<img
					src="/icons/pwa-192.png"
					alt="logo nuster"
					class="w-8 h-8 shadow-sm rounded-md hover:rotate-[2deg] transition-all duration-500"
				/>
				<span class="inline-block font-bold text-lg pr-3">Nuster</span>
			</a>
		{/if}

		{#if !index}
			{#each $navTitle as title}
				<div class="w-[2px] h-24 -my-8 bg-zinc-100 -skew-x-12" />
				<span class="font-bold text-white truncate">{title}</span>
			{/each}
			<Flex gap={1} class="ml-auto">
				{#if $navActions != null}
					{#each $navActions as btn}
						<Button on:click={btn.action} color={btn.color} size={'small'}>
							{btn.label}
						</Button>
					{/each}
				{/if}
			</Flex>
		{:else}
			<Flex gap={5} items="center" class="ml-auto">
				<Label color={'bg-white text-zinc-600'} class="font-semibold">
					{$date(dateNow)} - {$time(dateNow, { format: 'medium' })}
				</Label>
				{#if $machineData.machine.hypervisorData !== undefined}
					{#if ($machineData.machine.hypervisorData.overallDownloadProgress || 0) > 0 || $machineData.machine.hypervisorData.appState != 'applied'}
						<button
							class="rounded-full bg-white p-1 transition hover:rotate-180 duration-300"
							on:click={() => {
								displaySettings = false;
								displayInfo = false;
								displayNetworkInfo = false;
								displayUpdateScreen = false;
								shownModal = 'updates';
							}}
						>
							<span
								class="grid grid-cols-1 h-5 w-5 items-center justify-items-center self-center"
							>
								<svg
									id="glyphicons-basic"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 32 32"
									class="relative inline-flex fill-zinc-600 h-5 w-5"
									style="grid-area: 1/1/1/1;"
								>
									<path
										id="history"
										d="M17.01257,9.98438v4.2998a1.947,1.947,0,0,1,.91315,2.22729l1.6098,1.60987a1,1,0,0,1-1.41418,1.41418l-1.6098-1.60974a1.99075,1.99075,0,0,1-1.499-3.65527V9.98438a1,1,0,1,1,2,0ZM15.89484,4.00049A12.01,12.01,0,0,0,4.05066,15H1.95428a.50006.50006,0,0,0-.41113.78467l3.54578,5.12158a.5.5,0,0,0,.82214,0l3.54578-5.12158A.50006.50006,0,0,0,9.04572,15H7.059a9.0112,9.0112,0,0,1,8.7652-7.99829,9.102,9.102,0,0,1,9.17169,8.72412A8.9935,8.9935,0,0,1,9.827,22.54053a.99317.99317,0,0,0-1.50342.15136l-.57239.82691a1.01274,1.01274,0,0,0,.16272,1.32471A11.98253,11.98253,0,0,0,27.99036,15.5144,12.11761,12.11761,0,0,0,15.89484,4.00049Z"
									/>
								</svg>
								<span
									class="animate-ping relative inline-flex h-3 w-3 rounded-full bg-red-500 opacity-75"
									style="grid-area: 1/1/1/1;"
								/>
							</span>
						</button>
					{/if}
				{/if}

				<button
					class="rounded-full bg-white p-1 transition hover:rotate-180 duration-300"
					on:click={() => {
						displaySettings = false;
						displayInfo = false;
						displayNetworkInfo = false;
						displayUpdateScreen = false;
						shownModal = 'settings';
					}}
				>
					<svg
						id="glyphicons-basic"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 32 32"
						class="fill-zinc-600 h-5 w-5"
					>
						<path
							id="wrench"
							d="M27.405,12.91907a6.38551,6.38551,0,0,1-7.78314,3.70154L8.82825,27.41418A1,1,0,0,1,7.414,27.41412L4.58594,24.58575A.99993.99993,0,0,1,4.586,23.17157L15.33209,12.42548a6.4047,6.4047,0,0,1,3.69947-7.92487,6.22745,6.22745,0,0,1,2.77825-.49127.4987.4987,0,0,1,.34015.84857L19.73254,7.27533a.4961.4961,0,0,0-.131.469l.82916,3.38044a.496.496,0,0,0,.36365.36364l3.38068.82935a.49614.49614,0,0,0,.469-.131l2.419-2.41889a.49433.49433,0,0,1,.8446.30078A6.22117,6.22117,0,0,1,27.405,12.91907Z"
						/>
					</svg>
				</button>

				<button
					class="rounded-full bg-white p-1 transition hover:rotate-180 duration-300"
					on:click={() => {
						displaySettings = false;
						displayInfo = false;
						displayNetworkInfo = false;
						displayUpdateScreen = false;
						shownModal = 'info';
					}}
				>
					<svg
						id="glyphicons-basic"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 32 32"
						class="fill-zinc-600 h-5 w-5"
					>
						<path
							id="circle-info"
							d="M16,4A12,12,0,1,0,28,16,12.01312,12.01312,0,0,0,16,4Zm2.42529,10.91565L16.6,21h1.25958a.5.5,0,0,1,.48505.62134l-.25,1A.50007.50007,0,0,1,17.60962,23H14a1.40763,1.40763,0,0,1-1.42529-1.91565L14.4,15h-.75958a.5.5,0,0,1-.48505-.62134l.25-1A.49994.49994,0,0,1,13.89038,13H17A1.40763,1.40763,0,0,1,18.42529,14.91565Zm.14435-3.33337A.5.5,0,0,1,18.07642,12H15.59021a.5.5,0,0,1-.49316-.58228l.33331-2A.5.5,0,0,1,15.92358,9h2.48621a.5.5,0,0,1,.49316.58228Z"
						/>
					</svg>
				</button>

				{#if $machineData.machine.vpnData !== undefined}
					<button
						class="rounded-full bg-white p-1 transition hover:rotate-180 duration-300"
						on:click={() => {
							displaySettings = false;
							displayInfo = false;
							displayNetworkInfo = false;
							displayUpdateScreen = false;
							shownModal = 'network';
						}}
					>
						<svg
							id="glyphicons-basic"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 32 32"
							class="{$machineData.machine.vpnData?.vpn.connected
								? 'fill-emerald-500'
								: 'fill-orange-500'} h-5 w-5"
						>
							<path
								id="access-point"
								d="M22.90039,13a6.86213,6.86213,0,0,1-2.06207,4.90479,1.004,1.004,0,0,1-1.40955-.01453l-.5672-.56726a.98259.98259,0,0,1-.015-1.395,4.04755,4.04755,0,0,0,0-5.85608.98279.98279,0,0,1,.01507-1.39514l.56714-.56714a1.0041,1.0041,0,0,1,1.40955-.01441A6.86237,6.86237,0,0,1,22.90039,13Zm-11,0a4.05054,4.05054,0,0,1,1.25305-2.9281.98279.98279,0,0,0-.01507-1.39514l-.56714-.56714a1.0041,1.0041,0,0,0-1.40955-.01441,6.86424,6.86424,0,0,0,0,9.80958,1.004,1.004,0,0,0,1.40955-.01453l.5672-.56726a.98259.98259,0,0,0,.015-1.395A4.05027,4.05027,0,0,1,11.90039,13ZM24.39746,4.58252a1.01145,1.01145,0,0,0-1.43121-.0105l-.567.567a.99491.99491,0,0,0,.00708,1.41272,9.06577,9.06577,0,0,1,0,12.89648.99491.99491,0,0,0-.00708,1.41272l.567.567a1.01145,1.01145,0,0,0,1.43121-.0105,11.865,11.865,0,0,0,0-16.835ZM6.90039,13a9.06065,9.06065,0,0,1,2.6933-6.44824A.99491.99491,0,0,0,9.60077,5.139l-.567-.567a1.01145,1.01145,0,0,0-1.43121.0105,11.865,11.865,0,0,0,0,16.835,1.01145,1.01145,0,0,0,1.43121.0105l.567-.567a.99491.99491,0,0,0-.00708-1.41272A9.06065,9.06065,0,0,1,6.90039,13ZM16,11a2,2,0,1,0,2,2A2.00213,2.00213,0,0,0,16,11Zm.5,6h-1a.673.673,0,0,0-.62128.48511L14,21v6a1,1,0,0,0,1,1h2a1,1,0,0,0,1-1V21l-.87872-3.51489A.673.673,0,0,0,16.5,17Z"
							/>
						</svg>
					</button>
				{/if}
			</Flex>
		{/if}
	</Flex>
</div>

<Navcontainer bind:style={$useNavContainer}>
	<slot />
</Navcontainer>

{#if $navExpandBottom}
	<div class="h-16 w-1" />
{/if}
