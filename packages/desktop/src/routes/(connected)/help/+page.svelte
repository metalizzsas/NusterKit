<script lang="ts">
	
	import Flex from '$lib/components/layout/flex.svelte';
	import Wrapper from '$lib/components/Wrapper.svelte';
	import { _ } from 'svelte-i18n';
	import type { PageData } from './$types';
	import Grid from '$lib/components/layout/grid.svelte';
	import Wrapper2 from '$lib/components/Wrapper2.svelte';
	import { page } from '$app/stores';

	export let data: PageData;

</script>

<Grid cols={3}>
    {#each data.docFiles.filter(p => p.lang === $page.data.settings.lang) as page}
        <a href="/help{page.href}">
            <Wrapper2>
                <h3>{page.name}</h3>
                <Flex gap={2} class="my-2">
                    {#if page.type === "nuster"}
                        <img src="icons/icon-192.png" class="h-6 w-6 rounded-md" alt={$_('nuster.logo')} />
                    {:else}
                        <img src={`/files/icon.png`} class="h-6 dark:bg-white rounded-md" alt={"Logo machine"} />
                    {/if}
                    <p>
                        {#if page.type === "nuster"}
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
