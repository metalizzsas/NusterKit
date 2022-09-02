<script lang="ts">
	import {
		navActions,
		navBackFunction,
		navExpandBottom,
		navTitle,
		useNavContainer,
	} from '$lib/utils/stores/navstack';

	import { locales, _ } from 'svelte-i18n';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { BUNDLED } from '$lib/bundle';
	import { machineData } from '$lib/utils/stores/store';
	import { onMount } from 'svelte';
	import { Linker } from '$lib/utils/stores/linker';
	import { lang, dark, layoutSimplified } from '$lib/utils/stores/settings';

	import Modalcontent from '../modals/modalcontent.svelte';
	import Toggle from '../userInputs/toggle.svelte';
	import SvelteMarkdown from 'svelte-markdown';
	import Navcontainer from './navcontainer.svelte';
	import Button from '../button.svelte';
	import Flex from '../layout/flex.svelte';
	import Informations from './indexStackContent/informations.svelte';
	import Updates from './indexStackContent/updates.svelte';

	$: index = $page.url.pathname == '/app';

	let isShrinked = true;
	let isUpdateShrinked = true;

	let displayOptions = false;

	/// Modal options
	const langs: { [x: string]: string } = {
		en: 'English',
		fr: 'Français',
	};

	let markdownReleaseNotes = '';
	let markdownReleaseNotesUI = '';
	let displayUpdateNotes = false;
	let displayUpdateScreen = false;

	onMount(async () => {
		const releaseNotesRequest = await fetch('//' + $Linker + '/api/currentReleaseNotes');
		const ndreleaseNotesRequest = await fetch('/release.md');

		markdownReleaseNotes = await releaseNotesRequest.text();
		markdownReleaseNotesUI = await ndreleaseNotesRequest.text();
	});
</script>

<!--- options modal -->
<Modalcontent bind:shown={displayOptions} title={$_('settings.main')}>
	<div class="flex flex-col gap-3">
		{#if $machineData.machine.model == 'uscleaner'}
			<div class="flex flex-row justify-between dark:text-white text-gray-800 items-center">
				{$_('settings.layout-format')}
				<Toggle
					bind:value={$layoutSimplified}
					on:change={(e) => ($layoutSimplified = e.detail.value)}
				/>
			</div>
		{/if}
		<div class="flex flex-row justify-between dark:text-white text-gray-800 items-center">
			{$_('settings.enable-dark-mode')}
			<Toggle bind:value={$dark} on:change={(e) => ($dark = e.detail.value)} />
		</div>
		<div class="flex flex-row gap-4 justify-between dark:text-white text-gray-800 items-center">
			{$_('settings.language')}
			<select bind:value={$lang} class="text-gray-800 py-1 px-2 bg-gray-300">
				{#each $locales as locale}
					<option value={locale}>{langs[locale]}</option>
				{/each}
			</select>
		</div>
	</div>
</Modalcontent>

<Modalcontent bind:shown={displayUpdateNotes} title={$_('settings.updateNotes.main')}>
	<div class="markdown grid grid-cols-1 md:grid-cols-2 text-md">
		<div>
			<h1>{$_('settings.updateNotes.firmware')}</h1>
			<SvelteMarkdown source={markdownReleaseNotes} />
		</div>
		<div>
			<h1>{$_('settings.updateNotes.ui')}</h1>
			<SvelteMarkdown source={markdownReleaseNotesUI} />
		</div>
	</div>
</Modalcontent>

<Modalcontent
	bind:shown={displayUpdateScreen}
	title={$_('settings.updateGoing.title')}
	displayClose={false}
>
	{$_('settings.updateGoing.desc')}
</Modalcontent>

<div
	class="bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl ring-[0.5px] ring-indigo-300/50 mb-6 text-white"
>
	<Flex gap={6} align="middle" items="center" class="{index ? 'p-4' : 'p-2'} overflow-hidden">
		{#if !index}
			<div
				class="flex flex-row gap-1 items-center align-middle cursor-pointer"
				on:click={async () => {
					if ($navBackFunction) $navBackFunction();
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
			<div
				class="flex flex-rox gap-4 items-center hover:bg-white rounded-md hover:text-zinc-700 text-white transition-all duration-500 cursor-pointer"
				on:click={() => {
					BUNDLED == 'true' ? goto('/app') : goto('/');
				}}
			>
				<img
					src="/icons/pwa-192.png"
					alt="logo nuster"
					class="w-8 h-8 shadow-sm rounded-md hover:rotate-[2deg] transition-all duration-500"
				/>
				<span class="inline-block font-bold text-lg pr-3">Nuster</span>
			</div>
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
				{#if $machineData.machine.hypervisorData !== undefined}
					{#if ($machineData.machine.hypervisorData.overallDownloadProgress || 0) > 0 || $machineData.machine.hypervisorData.appState != 'applied'}
						<button
							class="rounded-full bg-white p-1 transition hover:rotate-180 duration-300"
							on:click={() => {
								isUpdateShrinked = !isUpdateShrinked;
								isShrinked = true;
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
						displayOptions = !displayOptions;
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
						isShrinked = !isShrinked;
						isUpdateShrinked = true;
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
			</Flex>
		{/if}
	</Flex>
	{#if index}
		{#if !isShrinked}
			<Informations bind:displayUpdateNotes />
		{:else if !isUpdateShrinked}
			<Updates bind:isUpdateShrinked bind:displayUpdateScreen />
		{/if}
	{/if}
</div>

<Navcontainer bind:style={$useNavContainer}>
	<slot />
</Navcontainer>

{#if $navExpandBottom}
	<div class="h-16 w-1" />
{/if}
