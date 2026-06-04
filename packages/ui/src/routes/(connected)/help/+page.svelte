<script lang="ts">
	import { _ } from 'svelte-i18n';
	import type { PageData } from './$types';
	import Grid from '$lib/components/layout/grid.svelte';
	import { page } from '$app/stores';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { ChevronRight, Folder } from '@steeze-ui/heroicons';

	let { data }: { data: PageData } = $props();
</script>

<Grid cols={3}>
    {#each data.docFiles.filter(p => p.lang === $page.data.settings.lang) as doc (doc.href)}
        <a
            href="/help{doc.href}"
            class="group flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-indigo-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
            <div class="flex w-full items-start justify-between gap-2">
                <h3 class="min-w-0 text-base font-semibold leading-snug">{doc.name}</h3>
                <Icon
                    src={ChevronRight}
                    theme="mini"
                    class="mt-0.5 h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-200 group-hover:translate-x-0.5"
                />
            </div>

            <div class="flex items-center gap-2">
                {#if doc.type === "nuster"}
                    <img src="icons/icon-192.png" class="h-5 w-5 rounded" alt={$_('nuster.logo')} />
                    <span class="text-sm text-zinc-600 dark:text-zinc-300">{$_('nuster.lead')}</span>
                {:else}
                    <img src={`/files/icon.png`} class="h-5 rounded dark:bg-white" alt={"Logo machine"} />
                {/if}

                {#if doc.folder !== undefined}
                    <span class="inline-flex items-center gap-1 rounded-md bg-zinc-200/60 px-1.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-300">
                        <Icon src={Folder} theme="solid" class="h-3 w-3 opacity-70" />
                        {doc.folder}
                    </span>
                {/if}
            </div>
        </a>
    {:else}
        <div class="col-span-3 rounded-xl border border-border bg-card p-6">
            <h3 class="text-amber-500">{$_('help.unavailable')}</h3>
        </div>
    {/each}
</Grid>
