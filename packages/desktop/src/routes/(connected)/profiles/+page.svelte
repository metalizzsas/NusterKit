<script lang="ts">
	
	import { translateProfileName } from '$lib/utils/i18n/i18nprofile';

	import { Icon } from '@steeze-ui/svelte-icon';
	import { UserCircle, Square3Stack3d } from '@steeze-ui/heroicons';
	import Flex from '$lib/components/layout/flex.svelte';
	import SelectableButton from '$lib/components/buttons/SelectableButton.svelte';
	import Wrapper from '$lib/components/Wrapper.svelte';

	import { date, time, _ } from 'svelte-i18n';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	export let data: PageData;

</script>

<Flex direction="row" gap={6}>
	<Wrapper>
		<Flex direction="col" gap={2}>
			<h1>{$_(`profile.lead`)}</h1>
			{#each data.profiles as profile}

				<SelectableButton 
					on:click={() => void goto(`/profiles/${profile._id}`)}
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
	<Wrapper class="grow self-start">
		<h3>{$_('profile.unselected.lead')}</h3>
		<p>{$_('profile.unselected.sub')}</p>
	</Wrapper>
</Flex>
