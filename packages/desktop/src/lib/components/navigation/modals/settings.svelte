<script lang="ts">
	import { _, locales } from 'svelte-i18n';
	import { layoutSimplified, dark, lang } from '$lib/utils/stores/settings';
	import { machineData } from '$lib/utils/stores/store';
	import { Linker } from '$lib/utils/stores/linker';

	import { goto } from '$app/navigation';

	import Modalcontent from "$lib/components/modals/modal.svelte";
	import Toggle from '$lib/components/userInputs/toggle.svelte';
	import Modalprompt from '$lib/components/modals/modalprompt.svelte';
	import Button from '$lib/components/button.svelte';

	export let shown: boolean;

	let advancedSettingsModalShown = false;

	/// Modal options
	const langs: { [x: string]: string } = {
		en: 'English',
		fr: 'Français',
		it: 'Italiano'
	};
</script>

<Modalcontent bind:shown title={$_('settings.main')}>
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
		<Button size={"small"} color={"bg-orange-500"} on:click={() => advancedSettingsModalShown = true}>Open advanced settings menu</Button>
	</div>
</Modalcontent>


<Modalprompt bind:shown={advancedSettingsModalShown} title="Advanced settings access" buttons={[{
	text: "Access",
	color: "bg-emerald-600",
	textColor: "bg-zinc-900",
	callback: (value) => {

		const result = fetch(`//${$Linker}/api/config/password/${value}`, { method: 'POST'}).then((result) => {

			if(result.ok && result.status == 200)
				void goto("/config", { replaceState: true });
			else 
				return true;
		});
	}
}]}>
	Enter password to access this sub menu
</Modalprompt>
