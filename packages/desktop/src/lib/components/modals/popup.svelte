<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { Linker } from '$lib/utils/stores/linker';
	import { goto } from '$app/navigation';

	import Flex from '../layout/flex.svelte';
	import Button from '../button.svelte';
	
	import type { ICallToAction } from '@metalizzsas/nuster-typings/build/spec/nuster/ICallToAction';
	import type { IPopupMessage } from '@metalizzsas/nuster-typings';
	import { execCTA } from '$lib/utils/callToAction';
	import Modal from './modal.svelte';

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

{#if modalData != null}
	<Modal bind:shown title={$_(modalData.title)}>
		<Flex direction="col" gap={(modalData.callToAction && modalData.callToAction.length > 0) ? 3 : 0}>
			<p>{$_(modalData.message)}</p>
			<Flex gap={3} direction={'col'}>
				{#if modalData.callToAction != undefined}
					{#each modalData.callToAction as cta}
						<Button on:click={async () => await executeCTA(cta)}>
							{$_(cta.name)}
						</Button>
					{/each}
				{/if}
			</Flex>
		</Flex>
	</Modal>
{/if}
