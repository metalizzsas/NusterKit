<script lang="ts">
	
	import Flex from '$lib/components/layout/flex.svelte';
	import Wrapper from '$lib/components/Wrapper.svelte';

    import { machine } from '$lib/utils/stores/nuster';
	import { _ } from 'svelte-i18n';
	import type { PageData } from './$types';
	import { settings } from '$lib/utils/stores/settings';
	import type { HelpDocument } from './+page.server';
	import Grid from '$lib/components/layout/grid.svelte';
	import Wrapper2 from '$lib/components/Wrapper2.svelte';

	export let data: PageData;

    const pageFilter = (page: HelpDocument) => {

        if(page.path.includes("/machine"))
            return (page.path.includes(`${$machine.model}-${$machine.variant}-${$machine.revision}`) && page.lang === $settings.lang)
        else
            return page.lang === $settings.lang
    };

    $: pages = data.documents.filter(pageFilter);

</script>

<Grid cols={3}>
    {#each pages as page}
        <a href="/help{page.path}">
            <Wrapper2>
                <h3>{page.name}</h3>
                <Flex gap={2} class="my-2">
                    {#if page.category === "software"}
                        <img src="icons/icon-192.png" class="h-6 w-6 rounded-md" alt={$_('nuster.logo')} />
                    {:else}
                        <img src="icons/machines/{$machine.model}.png" class="h-6 dark:bg-white rounded-md" alt={"Logo machine"} />
                    {/if}
                    <p>
                        {#if page.category === "software"}
                            {$_('nuster.lead')} 
                        {/if}

                        {#if page.folder !== undefined}
                            <span class="font-bold text-indigo-500">/</span>
                            {page.folder}
                        {/if}
                    </p>

                </Flex>
            </Wrapper2>
        </a>
    {:else}
        <Wrapper class="col-span-3"><h3 class="text-amber-500">{$_('help.unavailable')}</h3></Wrapper>
    {/each}
</Grid>
