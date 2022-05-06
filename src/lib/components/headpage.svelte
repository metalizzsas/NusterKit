<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { locale, locales } from 'svelte-i18n';
	import { machineData } from '$lib/utils/store';
	import { scale, fade } from 'svelte/transition';

	import img from '$lib/img/1024.png';
	import Modalcontent from './modals/modalcontent.svelte';
	import Toggle from '$lib/components/toggle.svelte';
	import { readDarkMode, updateDarkMode, setLang } from '$lib/utils/settings';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Linker } from '$lib/utils/linker';

	import SvelteMarkdown from 'svelte-markdown';

	let isShrinked = true;
	let isStartButtonShrinked = true;
	let isUpdateShrinked = true;

	let displayOptions = false;

	/// Modal options
	let dark = false;
	const langs: { [x: string]: string } = {
		fr: 'Français',
		en: 'English',
	};

	let ip: string = '';
	export let hypervisorIp: string;

	let markdownReleaseNotes = '';
	let displayUpdateNotes = false;
	let displayUpdateScreen = false;

	onMount(async () => {
		dark = readDarkMode();

		ip = $Linker;

		const releaseNotesRequest = await fetch('http://' + $Linker + '/currentReleaseNotes');

		markdownReleaseNotes = await releaseNotesRequest.text();
	});

	function restartMachine() {
		fetch(hypervisorIp + '/v1/reboot');
	}

	async function triggerUpdate() {
		const req = await fetch('http://' + $Linker + '/forceUpdate');

		if (req.status == 200) {
			displayUpdateScreen = true;
		}
	}

	$: setLang($locale as string);
</script>

<!--- options modal -->
<Modalcontent bind:shown={displayOptions} title={$_('settings.main')}>
	<div class="flex flex-col gap-3">
		<div
			class="flex flex-row justify-between dark:text-white text-gray-800 py-2 px-3 pr-2 items-center font-semibold"
		>
			{$_('settings.enable-dark-mode')}
			<Toggle bind:value={dark} on:change={(e) => updateDarkMode(e.detail.value)} />
		</div>
		<div
			class="flex flex-row gap-4 justify-between dark:text-white text-gray-800 py-2 px-3 pr-2 items-center font-semibold"
		>
			{$_('settings.language')}
			<select bind:value={$locale} class="text-gray-800 py-1 px-2 bg-gray-300">
				{#each $locales as locale}
					<option value={locale}>{langs[locale]}</option>
				{/each}
			</select>
		</div>
	</div>
</Modalcontent>

<Modalcontent bind:shown={displayUpdateNotes} title={$_('settings.updateNotes')}>
	<div class="markdown">
		<SvelteMarkdown source={markdownReleaseNotes} />
	</div>
</Modalcontent>

<Modalcontent
	bind:shown={displayUpdateScreen}
	title={$_('settings.updateGoing.title')}
	displayClose={false}
>
	{$_('settings.updateGoing.desc')}
</Modalcontent>

<!-- header info block -->
<div
	class="bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-b-3xl -m-6 mb-5 p-5 text-white shadow-2xl"
	id="informationWrapper"
>
	<div class="grid grid-col-2 gap-4">
		<div id="informationContent">
			<div class="flex flex-row justify-between items-center">
				<div class="flex flex-rox gap-4 items-center">
					{#if isShrinked}
						<!-- svelte-ignore component-name-lowercase -->
						<img
							in:scale
							out:scale
							src={img}
							alt="logo nuster"
							class="w-8 h-8 shadow-sm rounded-md hover:rotate-[2deg] transition-all"
						/>
					{/if}
					<span
						class="inline-block text-white font-semibold {!isShrinked
							? 'border-b-zinc-100 border-b-2'
							: ''} text-lg {isShrinked ? 'cursor-pointer' : ''}"
						in:fade
						out:fade
						on:click={() => {
							if (isShrinked) {
								ip == '127.0.0.1' ? goto('/app') : goto('/');
							}
						}}
					>
						{isShrinked ? 'Nuster' : $_('machine.informations')}
					</span>
				</div>

				<div class="flex flex-row gap-5 items-center">
					{#if $machineData.machine.hypervisorData !== undefined}
						{#if ($machineData.machine.hypervisorData.overallDownloadProgress || 0) > 0 || $machineData.machine.hypervisorData.appState != 'applied'}
							<button
								class="rounded-full backdrop-brightness-125 p-1 transition hover:rotate-180 duration-300"
								on:click={() => {
									isUpdateShrinked = !isUpdateShrinked;
									isShrinked = true;
									isStartButtonShrinked = true;
								}}
							>
								<span
									class="grid grid-cols-1 h-5 w-5 items-center justify-items-center self-center"
								>
									<svg
										id="glyphicons-basic"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 32 32"
										class="relative inline-flex fill-white h-5 w-5"
										style="grid-area: 1/1/1/1;"
									>
										<path
											id="history"
											d="M17.01257,9.98438v4.2998a1.947,1.947,0,0,1,.91315,2.22729l1.6098,1.60987a1,1,0,0,1-1.41418,1.41418l-1.6098-1.60974a1.99075,1.99075,0,0,1-1.499-3.65527V9.98438a1,1,0,1,1,2,0ZM15.89484,4.00049A12.01,12.01,0,0,0,4.05066,15H1.95428a.50006.50006,0,0,0-.41113.78467l3.54578,5.12158a.5.5,0,0,0,.82214,0l3.54578-5.12158A.50006.50006,0,0,0,9.04572,15H7.059a9.0112,9.0112,0,0,1,8.7652-7.99829,9.102,9.102,0,0,1,9.17169,8.72412A8.9935,8.9935,0,0,1,9.827,22.54053a.99317.99317,0,0,0-1.50342.15136l-.57239.82691a1.01274,1.01274,0,0,0,.16272,1.32471A11.98253,11.98253,0,0,0,27.99036,15.5144,12.11761,12.11761,0,0,0,15.89484,4.00049Z"
										/>
									</svg>
									<span
										class="animate-ping relative inline-flex h-3 w-3 rounded-full bg-white opacity-75"
										style="grid-area: 1/1/1/1;"
									/>
								</span>
							</button>
						{/if}
					{/if}

					<button
						class="rounded-full backdrop-brightness-125 p-1 transition hover:rotate-180 duration-300"
						on:click={() => {
							displayOptions = !displayOptions;
						}}
					>
						<svg
							id="glyphicons-basic"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 32 32"
							class="fill-white h-5 w-5"
						>
							<path
								id="wrench"
								d="M27.405,12.91907a6.38551,6.38551,0,0,1-7.78314,3.70154L8.82825,27.41418A1,1,0,0,1,7.414,27.41412L4.58594,24.58575A.99993.99993,0,0,1,4.586,23.17157L15.33209,12.42548a6.4047,6.4047,0,0,1,3.69947-7.92487,6.22745,6.22745,0,0,1,2.77825-.49127.4987.4987,0,0,1,.34015.84857L19.73254,7.27533a.4961.4961,0,0,0-.131.469l.82916,3.38044a.496.496,0,0,0,.36365.36364l3.38068.82935a.49614.49614,0,0,0,.469-.131l2.419-2.41889a.49433.49433,0,0,1,.8446.30078A6.22117,6.22117,0,0,1,27.405,12.91907Z"
							/>
						</svg>
					</button>

					<button
						class="rounded-full backdrop-brightness-125 p-1 transition hover:rotate-180 duration-300"
						on:click={() => {
							isShrinked = !isShrinked;
							isUpdateShrinked = true;
							isStartButtonShrinked = true;
						}}
					>
						<svg
							id="glyphicons-basic"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 32 32"
							class="fill-white h-5 w-5"
						>
							<path
								id="circle-info"
								d="M16,4A12,12,0,1,0,28,16,12.01312,12.01312,0,0,0,16,4Zm2.42529,10.91565L16.6,21h1.25958a.5.5,0,0,1,.48505.62134l-.25,1A.50007.50007,0,0,1,17.60962,23H14a1.40763,1.40763,0,0,1-1.42529-1.91565L14.4,15h-.75958a.5.5,0,0,1-.48505-.62134l.25-1A.49994.49994,0,0,1,13.89038,13H17A1.40763,1.40763,0,0,1,18.42529,14.91565Zm.14435-3.33337A.5.5,0,0,1,18.07642,12H15.59021a.5.5,0,0,1-.49316-.58228l.33331-2A.5.5,0,0,1,15.92358,9h2.48621a.5.5,0,0,1,.49316.58228Z"
							/>
						</svg>
					</button>

					<button
						class="rounded-full backdrop-brightness-125 p-1 transition hover:rotate-180 duration-300"
						on:click={() => {
							isStartButtonShrinked = !isStartButtonShrinked;

							isShrinked = true;
							isUpdateShrinked = true;
						}}
					>
						<svg
							id="glyphicons-basic"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 32 32"
							class="fill-red-500 h-5 w-5"
						>
							<path
								id="power"
								d="M15,16V4a1,1,0,0,1,1-1h1a1,1,0,0,1,1,1V16a1,1,0,0,1-1,1H16A1,1,0,0,1,15,16Zm7.63947-9.21533a1.009,1.009,0,0,0-1.43769.39477l-.45318.89649a.989.989,0,0,0,.34283,1.2799,8.5028,8.5028,0,1,1-9.18683.00257.99122.99122,0,0,0,.3468-1.28247l-.4533-.89673a1.01154,1.01154,0,0,0-1.446-.38916A11.43919,11.43919,0,0,0,5.00647,16.89075,11.50009,11.50009,0,0,0,28,16.5,11.43516,11.43516,0,0,0,22.63947,6.78467Z"
							/>
						</svg>
					</button>
				</div>
			</div>

			{#if !isShrinked}
				<div in:scale out:scale>
					<div class="flex flex-row flex-wrap gap-5 items-center mt-4">
						<span
							class="block text-white font-medium py-2 px-4 rounded-full backdrop-brightness-125"
						>
							{$_('machine.model')}: {$machineData.machine.model.toLocaleLowerCase()}
						</span>
						<span
							class="block text-white font-medium py-2 px-4 rounded-full backdrop-brightness-125"
						>
							{$_('machine.variant')}: {$machineData.machine.variant.toUpperCase()}
						</span>
						<span
							class="block text-white font-medium py-2 px-4 rounded-full backdrop-brightness-125"
						>
							{$_('machine.revision')}: {$machineData.machine.revision}
						</span>
						<span
							class="block text-white font-medium py-2 px-4 rounded-full backdrop-brightness-125"
						>
							{$_('machine.cycleCount')}: {$machineData.maintenances.find(
								(k) => k.name == 'cycleCount',
							)?.durationActual || '0'}
						</span>
						<span
							class="block text-white font-medium py-2 px-4 rounded-full backdrop-brightness-150 cursor-pointer"
							on:click={() => (displayUpdateNotes = true)}
						>
							{$_('machine.nusterVersion')}: {$machineData.machine.nusterVersion} ↗
						</span>
						{#if $machineData.machine.balenaVersion}
							<span
								class="block text-white font-medium py-2 px-4 rounded-full backdrop-brightness-125"
							>
								{$_('machine.balenaVersion')}: {$machineData.machine.balenaVersion}
							</span>
						{/if}
						<span
							class="block text-white font-medium py-2 px-4 rounded-full backdrop-brightness-125"
						>
							{$_('machine.serial')}: {$machineData.machine.serial.toLocaleUpperCase()}
						</span>
					</div>
				</div>
			{/if}

			{#if !isStartButtonShrinked}
				<div in:scale out:scale class="mt-3 flex flex-row gap-4 justify-items-start">
					<button
						class="bg-red-500 rounded-xl py-2 px-3 text-white font-semibold"
						on:click={restartMachine}
					>
						{$_('settings.restart')}
					</button>

					<button
						class="bg-orange-500 rounded-xl py-2 px-3 text-white font-semibold"
						on:click={() => (window.location.href = '/machine')}
					>
						{$_('settings.reload-nuster')}
					</button>
				</div>
			{/if}

			{#if $machineData.machine.hypervisorData !== undefined}
				{#if !isUpdateShrinked}
					<div in:scale out:scale>
						<div class="flex flex-row flex-wrap gap-5 items-center mt-4">
							{#if $machineData.machine.hypervisorData.overallDownloadProgress !== null}
								<span class="font-semibold">{$_('settings.updateProgress')}</span>
								<div class="rounded-full h-8 p-1 w-1/3 backdrop-brightness-125">
									<div
										class="h-6 bg-white animate-pulse text-xs rounded-full text-zinc-700 flex flex-row justify-center items-center"
										style="width: {Math.floor(
											$machineData.machine.hypervisorData
												.overallDownloadProgress ?? 0,
										)}%"
									>
										{#if $machineData.machine.hypervisorData.overallDownloadProgress ?? 0 > 10}
											<span class="font-semibold">
												{Math.floor(
													$machineData.machine.hypervisorData
														.overallDownloadProgress ?? 0,
												)} %
											</span>
										{/if}
									</div>
								</div>
							{/if}

							{#if $machineData.machine.hypervisorData.appState != 'applied' && $machineData.machine.hypervisorData.overallDownloadProgress == null}
								<button
									class="backdrop-brightness-150 rounded-xl py-2 px-3 text-white font-semibold pointer-cursor"
									on:click={triggerUpdate}
								>
									{$_('settings.triggerUpdate')}
								</button>
							{/if}
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>
