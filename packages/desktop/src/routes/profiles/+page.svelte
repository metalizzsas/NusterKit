<script lang="ts">
	
	import { translateProfileName } from '$lib/utils/i18n/i18nprofile';
	import type { ProfileHydrated } from '@metalizzsas/nuster-typings/build/hydrated/profiles';

	import { Icon } from '@steeze-ui/svelte-icon';
	import { UserCircle, Square3Stack3d } from '@steeze-ui/heroicons';
	import Flex from '$lib/components/layout/flex.svelte';
	import SelectableButton from '$lib/components/buttons/SelectableButton.svelte';
	import Wrapper from '$lib/components/Wrapper.svelte';
	import Profile from './Profile.svelte';

	import { date, time, _ } from 'svelte-i18n';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	let selectedProfile: ProfileHydrated | undefined = undefined;
	let selectedProfileId: string | undefined;

	/// — Reactive statements
	$: selectedProfile = data.profiles.find(k => k._id == selectedProfileId);

</script>

<Flex direction="row" gap={selectedProfileId !== undefined ? 0 : 6}>
	<div 
		class="overflow-y-scroll drop-shadow-xl duration-300"
		class:max-w-0={selectedProfileId !== undefined}
		class:min-w-0={selectedProfileId !== undefined}
		class:shrink={selectedProfileId !== undefined}
	>
	<Wrapper>
		<Flex direction="col" gap={2}>
			<h1>{$_(`profile.lead`)}</h1>
			{#each data.profiles as profile}

				<SelectableButton 
					selected={selectedProfileId == profile._id}
					on:click={() => {
						if (selectedProfileId == profile?._id) {
							selectedProfileId = undefined;
						} else {
							selectedProfileId = profile._id;
						}
					}}
				>
					<Flex gap={4} items="center">
						<Icon
							src={profile.isPremade ? Square3Stack3d : UserCircle}
							theme="solid"
							class="text-indigo-500 h-6 w-6"
						/>
						<Flex direction="col" gap={0} items="start" justify="items-start">
							<h2>{translateProfileName($_, profile)}</h2>
							<p class="text-sm text-zinc-600 dark:text-zinc-300">
								{#if profile.isPremade}
									{$_('profile.premades.true')}
								{:else}
									{$date(new Date(profile.modificationDate), { format: "medium"})} 
									—
									{$time(new Date(profile.modificationDate), { format: "medium"})} 
								{/if}
							</p>
						</Flex>
					</Flex>
				</SelectableButton>
			{/each}
		</Flex>
	</Wrapper>
	</div>

	<div class="overflow-y-scroll grow drop-shadow-xl">
		<Wrapper>
			{#if selectedProfile !== undefined}
				<Profile bind:profile={selectedProfile} on:exit={() => { selectedProfileId = undefined; void invalidateAll()}} />
			{:else}
				<h3>{$_('profile.unselected.lead')}</h3>
				<p>{$_('profile.unselected.sub')}</p>
			{/if}
		</Wrapper>
	</div>
</Flex>
