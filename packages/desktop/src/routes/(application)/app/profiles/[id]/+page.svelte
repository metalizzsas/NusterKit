<script lang="ts">
	import '$lib/app.css';
	import Modal from '$lib/components/modals/modal.svelte';
	import Inputkb from '$lib/components/userInputs/inputkb.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { Linker } from '$lib/utils/stores/linker';
	import { navActions, navBackFunction, navTitle } from '$lib/utils/stores/navstack';
	import Navcontainertitle from '$lib/components/navigation/navcontainertitle.svelte';
	import Navcontainertitlesided from '$lib/components/navigation/navcontainertitlesided.svelte';

	import type { PageData } from './$types';
	import ProfileCategory from '$lib/components/profile/profileCategory.svelte';
	export let data: PageData;

	let profile = data.profile;

	let saveModalShown = false;
	let saveModalCancel = false;
	let initialProfile: string;

	onMount(() => {
		initialProfile = JSON.stringify(profile);
	});

	const save = () => {
		fetch('//' + $Linker + '/api/v1/profiles', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(profile),
		}).then(() => {
			void goto('/app/profiles');
		}).catch(() => {
			console.error("Failed to save profile");
		})
	}

	const exit = async () => {
		return new Promise<void>((resolve) => {
			if (initialProfile !== JSON.stringify(profile)) {
				saveModalShown = true;
				const timer = setInterval(() => {
					if (saveModalShown == false) {
						resolve();
						clearInterval(timer);
						if (saveModalCancel == true) saveModalCancel = false;
						else void goto('/app/profiles');
					}
				}, 100);
			} else {
				void goto('/app/profiles');
			}
		});
	};

	onDestroy(() => {
		$navBackFunction = null;
		$navActions = null;
	});

	$: $navTitle = [
		$_('profile.list'),
		profile.isPremade ? $_('cycle.types.' + profile.name) : profile.name,
	];
	$navActions = [];
	$navBackFunction = exit;
</script>

<Modal
	bind:shown={saveModalShown}
	title={$_('profile.modals.save.title').replace(
		'{profile.name}',
		profile.isPremade ? $_('cycle.types.' + profile.name) : profile.name,
	)}
	buttons={[
		{
			text: $_('yes'),
			color: 'bg-emerald-500',
			callback: save,
		},
		{
			text: $_('no'),
			color: 'bg-red-500',
		},
		{
			text: $_('cancel'),
			color: 'bg-gray-500',
			callback: () => {
				saveModalCancel = true;
			},
		},
	]}
>
	{$_('profile.modals.save.message').replace(
		'{profile.name}',
		profile.isPremade ? $_('cycle.types.' + profile.name) : profile.name,
	)}
</Modal>

<Navcontainertitle>{$_('profile.globals')}</Navcontainertitle>

<div class="bg-zinc-700 rounded-full py-1 px-4 flex flex-row justify-between items-center mb-5">
	<span class="text-white font-semibold">{$_('profile.name')}</span>
	<Inputkb
		bind:value={profile.name}
		options={{
			class: 'border-0 bg-neutral-100 dark:bg-zinc-600 font-semibold px-3 py-1 -mr-3 rounded-full w-1/3',
		}}
		disabled={profile.isOverwritable !== undefined}
	/>
</div>

<Navcontainertitlesided>{$_('profile.settings')}</Navcontainertitlesided>

<div class="flex flex-col gap-2">
	{#each Array.from(new Set(profile.values.map(f => f.name.split("#")[0]))) as category}
		<ProfileCategory bind:profile bind:category />
	{/each}
</div>
