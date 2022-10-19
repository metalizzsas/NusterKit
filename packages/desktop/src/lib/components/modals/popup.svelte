<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { Linker } from '$lib/utils/stores/linker';
	import { goto } from '$app/navigation';

	import Flex from '../layout/flex.svelte';
	import Actionmodal from './actionmodal.svelte';
	import Button from '../button.svelte';
	
	import type { ICallToAction } from '@metalizzsas/nuster-typings/build/spec/nuster/ICallToAction';
	import type { IPopupMessage } from '@metalizzsas/nuster-typings';
	import { execCTA } from '$lib/utils/callToAction';

	export let shown: boolean;
	export let modalData: IPopupMessage | null;

	const executeCTA = async (cta: ICallToAction) => {

		const url = await execCTA($Linker, cta);

		if(url)
		{
			void goto(url);
			shown = false;
		}
	}
</script>

<Actionmodal bind:shown>
	{#if modalData != null}
		<Flex direction="col" gap={3}>
			<h2 class="text-xl leading-6 text-center">{$_(modalData.title)}</h2>

			<p>{$_(modalData.message)}</p>

			<Flex gap={3} direction={'col'}>
				{#if modalData.callToAction != undefined}
					{#each modalData.callToAction as cta}
						<Button on:click={async () => await executeCTA(cta)}>
							{$_(cta.name)}
						</Button>
					{/each}
				{/if}
				<Button on:click={() => (shown = false)} color="bg-orange-400">
					{$_('close-modal')}
				</Button>
			</Flex>
		</Flex>
	{/if}
</Actionmodal>
