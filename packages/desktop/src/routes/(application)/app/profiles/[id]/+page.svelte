<script lang="ts">
	import { goto } from '$app/navigation';
	import Modal from '$lib/components/modals/modalchoice.svelte';
	import Navcontainertitle from '$lib/components/navigation/navcontainertitle.svelte';
	import Inputkb from '$lib/components/userInputs/inputkb.svelte';
	import { Linker } from '$lib/utils/stores/linker';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';

	import Navbackfunction from '$lib/components/navigation/navstack/navbackfunction.svelte';
	import Navtitle from '$lib/components/navigation/navstack/navtitle.svelte';
	import ProfileCategory from '$lib/components/profile/profileCategory.svelte';
	import { translateProfileName } from '$lib/components/profile/profiletranslation';
	import type { PageData } from './$types';
	import Navcontainer from '$lib/components/navigation/navcontainer.svelte';
	import Flex from '$lib/components/layout/flex.svelte';
	
	export let data: PageData;

	let profile = data.profile;

	let saveModalShown = false;
	let saveModalCancel = false;
	let initialProfile: string;

	onMount(() => {
		if(translateProfileName($_, profile) !== profile.name)
			profile.name = translateProfileName($_, profile);

		initialProfile = JSON.stringify(profile);
	});

	const saveProfile = () => {
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

	const exitProfileEditing = async () => {
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
</script>

<Navtitle title={[$_('profile.list'), translateProfileName($_, profile)]}/>
<Navbackfunction backFunction={exitProfileEditing}/>

<Modal
	bind:shown={saveModalShown}
	title={$_('profile.modals.save.title').replace(
		'{profile.name}',
		translateProfileName($_, profile),
	)}
	buttons={[
		{
			text: $_('yes'),
			color: 'bg-emerald-500',
			callback: saveProfile,
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
		translateProfileName($_, profile),
	)}
</Modal>

<Navcontainer>
	<Navcontainertitle>{$_('profile.globals')}</Navcontainertitle>
	
	<div class="bg-zinc-700 rounded-full py-1 px-4 flex flex-row justify-between items-center mb-5">
		<span class="text-white font-semibold">{$_('profile.name')}</span>
		<Inputkb
			bind:value={profile.name}
			options={{
				class: 'border-0 bg-neutral-100 dark:bg-zinc-600 font-semibold px-3 py-1 -mr-3 rounded-full w-1/3',
			}}
			disabled={profile.isOverwritable === false}
		/>
	</div>
	
	<Navcontainertitle sided={true}>{$_('profile.settings')}</Navcontainertitle>
	
	<Flex direction="col" gap={2}>
		{#each Array.from(new Set(profile.values.map(f => f.name.split("#")[0]))) as category}
			<ProfileCategory bind:profile bind:category />
		{/each}
	</Flex>
</Navcontainer>


