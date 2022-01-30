<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { machineData } from '$lib/utils/store';
	import { scale, fade } from 'svelte/transition';

	import img from '$lib/img/1024.png';
	import Modalcontent from './modals/modalcontent.svelte';
	import Toggle from '$lib/components/toggle.svelte';
	import { getLang, readDarkMode, setLang, updateDarkMode } from '$lib/utils/settings';
	import { onMount } from 'svelte';

	let isShrinked = true;

	let isStartButtonShrinked = true;

	let displayOptions = false;

	/// Modal options
	let dark = false;
	let lang = 'en';

	onMount(() => {
		dark = readDarkMode();
		lang = getLang();
	});
</script>

<!--- options modal -->
<Modalcontent bind:shown={displayOptions} title={$_('settings.main')}>
	<div class="flex flex-col gap-4">
		<div
			class="flex flex-row justify-between bg-black rounded-full text-white py-2 px-3 pr-2 items-center text-md font-semibold"
		>
			{$_('settings.enable-dark-mode')}
			<Toggle bind:value={dark} on:change={(e) => updateDarkMode(e.detail.value)} />
		</div>
		<div
			class="flex flex-row gap-4 justify-between bg-black rounded-full text-white py-2 px-3 pr-2 text-md items-center font-semibold"
		>
			{$_('settings.language')}
			<select bind:value={lang} class="text-gray-800 py-1 px-2">
				<option value="en">English</option>
				<option value="fr">Français</option>
			</select>

			<button
				on:click={() => {
					setLang(lang);
					window.location.reload();
				}}
				class="bg-indigo-500 py-1 px-2 rounded-xl text-white font-semibold"
			>
				{$_('settings.apply-language')}
			</button>
		</div>
	</div>
</Modalcontent>

<!-- header info block -->
<div
	class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-b-3xl -m-6 mb-5 p-5 text-white shadow-2xl"
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
								window.location.href = '/app';
							}
						}}
					>
						{isShrinked ? 'Nuster' : $_('machine.informations')}
					</span>
				</div>

				<div class="flex flex-row gap-5 items-center">
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
							if (isStartButtonShrinked === false && isShrinked === false)
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

							if (isStartButtonShrinked === false && isShrinked === false)
								isShrinked = true;
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
					<div class="grid grid-cols-4 gap-5 items-center mt-4">
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
					</div>
					<div class="flex flex-col mt-3">
						<span
							class="block text-white font-medium py-2 px-4 rounded-full backdrop-brightness-125"
						>
							{$_('machine.serial')}: {$machineData.machine.serial.toLocaleUpperCase()}
						</span>
					</div>
				</div>
			{/if}

			{#if !isStartButtonShrinked}
				<div in:scale out:scale class="mt-3">
					<button class="bg-red-500 rounded-xl py-2 px-3 text-white font-semibold">
						{$_('settings.restart')}
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>
