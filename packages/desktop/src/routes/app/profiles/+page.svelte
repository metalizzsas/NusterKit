<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import '$lib/app.css';
	import ModalPrompt from '$lib/components/modals/modalprompt.svelte';
	import NavContainer from '$lib/components/navigation/navcontainer.svelte';
	import Profile from '$lib/components/profile/profile.svelte';
	import type { Profile as ProfileModel } from '$lib/utils/interfaces';
	import { Linker } from '$lib/utils/stores/linker';
	import {
		navActions,
		navBackFunction,
		navTitle,
		useNavContainer,
	} from '$lib/utils/stores/navstack';
	import { onDestroy } from 'svelte';
	import { _ } from 'svelte-i18n';
	import Flex from '$lib/components/layout/flex.svelte';
	import Navcontainertitle from '$lib/components/navigation/navcontainertitle.svelte';

	import type { PageData } from './$types';

	export let data: PageData;

	let profiles: ProfileModel[] = data.profiles;
	let profileSkeletons: string[] = data.profileSkeletons;

	let addProfileModalShown = false;

	async function listProfileBlueprint() {
		if (profileSkeletons.length == 1) {
			createProfile(profileSkeletons[0]);
		} else {
			addProfileModalShown = true;
		}
	}

	async function createProfile(type: string) {
		const createUrl = '//' + $Linker + '/api/v1/profiles/create/' + type;

		console.log(createUrl);

		let response = await fetch(createUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		let p = (await response.json()) as ProfileModel;

		goto(`profiles/${p.id}`);
	}
	$navTitle = [$_('profile.list')];
	$navBackFunction = () => goto('/app');
	$navActions = [
		{
			action: listProfileBlueprint,
			color: 'bg-emerald-500',
			label: $_('profile.buttons.add'),
		},
	];
	$useNavContainer = false;

	onDestroy(() => ($useNavContainer = true));
</script>

<ModalPrompt
	bind:shown={addProfileModalShown}
	title={$_('profile.modals.create.title')}
	buttons={[
		{
			text: $_('ok'),
			color: 'bg-emerald-500',
			callback: (value) => {
				createProfile(value || 'default');
			},
		},
		{
			text: $_('cancel'),
			color: 'bg-gray-500',
			callback: () => {},
		},
	]}
>
	{$_('profile.modals.create.message')}
</ModalPrompt>

{#each [...new Set(profiles.map((p) => p.isPremade))] as premade}
	<NavContainer>
		<Navcontainertitle>{$_('profile.premades.' + premade)}</Navcontainertitle>
		<Flex direction="col">
			{#each profiles.filter((p) => p.isPremade == premade) as profile}
				<Profile
					{profile}
					delCb={async () => await invalidate('//' + $Linker + '/api/v1/profiles')}
				/>
			{/each}
		</Flex>
	</NavContainer>
{/each}
