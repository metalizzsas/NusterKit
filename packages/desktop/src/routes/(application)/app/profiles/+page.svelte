<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import '$lib/app.css';
	import ModalPrompt from '$lib/components/modals/modalprompt.svelte';
	import NavContainer from '$lib/components/navigation/navcontainer.svelte';
	import Profile from '$lib/components/profile/profile.svelte';
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
	import type { IProfileHydrated } from '@metalizzsas/nuster-typings/build/hydrated/profile';

	export let data: PageData;

	let addProfileModalShown = false;

	const listProfileBlueprint = async () =>  {
		if (data.profileSkeletons.length == 1)
		{
			await createProfile(data.profileSkeletons.at(0)?.name ?? 'default');
		}
		else
		{
			addProfileModalShown = true;
		}
	}

	const createProfile = async (type: string) => {
		const createUrl = '//' + $Linker + '/api/v1/profiles/create/' + type;

		console.log(createUrl);

		let response = await fetch(createUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		let p = (await response.json()) as IProfileHydrated;

		void goto(`profiles/${p.id ?? ''}`);
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
			callback: createProfile,
		},
		{
			text: $_('cancel'),
			color: 'bg-gray-500'
		},
	]}
>
	{$_('profile.modals.create.message')}
</ModalPrompt>

{#each [...new Set(data.profiles.map((p) => p.isPremade))] as premade}
	<NavContainer>
		<Navcontainertitle>{$_(`profile.premades.${premade ? 'true' : 'false'}`)}</Navcontainertitle>
		<Flex direction="col">
			{#each data.profiles.filter((p) => p.isPremade == premade) as profile}
				<Profile
					{profile}
					delCb={async () => await invalidate('//' + $Linker + '/api/v1/profiles')}
				/>
			{/each}
		</Flex>
	</NavContainer>
{/each}
