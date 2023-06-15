<script lang="ts">
	
	import { Icon } from '@steeze-ui/svelte-icon';
	import Flex from '$lib/components/layout/flex.svelte';
	import SelectableButton from '$lib/components/buttons/SelectableButton.svelte';
	import Wrapper from '$lib/components/Wrapper.svelte';
	import SvelteMarkdown from 'svelte-markdown';
	import HelpImageParser from './HelpImageParser.svelte';
	import { BookOpen, Folder } from '@steeze-ui/heroicons';

	import { _ } from 'svelte-i18n';
	import type { PageData } from './$types';
	import { setContext } from 'svelte';
    import { writable, type Writable } from 'svelte/store';
	import { settings } from '$lib/utils/stores/settings';
	import HelpLinkParser from './HelpLinkParser.svelte';
	import Select from '$lib/components/inputs/Select.svelte';
	import type { HelpDocument } from './+page.server';
	import { machine } from '$lib/utils/stores/nuster';

	export let data: PageData;

    let category: "software" | "machine" = "software";

    let selectedHelp = writable<string | undefined>(undefined);
    let helpContent: string | undefined;

    setContext<Writable<string | undefined>>("help", selectedHelp);

    const pageFilter = (page: HelpDocument, cat: typeof category) => {
        return (cat === "machine") ? (page.path.includes(`${$machine.model}-${$machine.variant}-${$machine.revision}`) && page.lang === $settings.lang && page.category === cat) : (page.category === cat && $settings.lang);
    };

    $: pages = data.documents.filter((p) => pageFilter(p, category));
    $: category, function() {
        const firstPage = pages.find(d => d.folder === "root" && d.path.includes("index.md"));
        $selectedHelp = (firstPage !== undefined) ? firstPage.path : undefined;
    }();

    selectedHelp.subscribe((v) => {
        if(v !== undefined)
        {
            fetch(`/documentation/${v}`)
                .then(res => res.text())
                .then(text => helpContent = text)
                .catch(() => selectedHelp.set(undefined));
        }
        else
            helpContent = undefined;
    });

</script>

<Flex direction="row">
	<div class="drop-shadow-xl duration-300 grow">
        <Wrapper>
            <Select bind:value={category} selectableValues={[{ name: $_('help.category.software'), value: "software" }, { name: $_('help.category.machine'), value: "machine" }]} class="mb-6" />

            {#if pages.length === 0}
                <h3 class="text-amber-500">{$_('help.unavailable')}</h3>
            {/if}
            
            <Flex direction="col" gap={1}>
                {#each [...new Set(pages.map(k => k.folder))] as folder}

                    {#if folder !== "999-root"}
                        <h3 class="my-1">
                            <Icon src={Folder} class="h-4 w-4 text-indigo-500 inline mr-1" />
                            {folder}
                        </h3>
                    {:else}
                        <div class="h-[1px] bg-zinc-300/50 my-2" />
                    {/if}

                    {#each pages.filter(p => p.folder === folder) as helpFile (helpFile.path)}
                        <SelectableButton 
                            selected={helpFile.path === $selectedHelp}
                            on:click={() => ($selectedHelp === helpFile.path) ? $selectedHelp = undefined : $selectedHelp = helpFile.path}
                        >
                            <h4 class="leading-6 text-start">
                                <Icon src={BookOpen} class="h-4 w-4 text-indigo-500 inline mr-1"/>
                                {helpFile.name}
                            </h4>
                        </SelectableButton>
                    {/each}

                {/each}
            </Flex>
        </Wrapper>
	</div>

	<div class="grow drop-shadow-xl max-w-[66%]">
        <Wrapper>
            {#if selectedHelp !== undefined && helpContent !== undefined}
                <div class="markdown">
                    <SvelteMarkdown source={helpContent} renderers={{ image: HelpImageParser, link: HelpLinkParser }}/>
                </div>
            {:else}
                <h1>{$_('help.unselected.lead')}</h1>
                <p>{$_('help.unselected.sub')}</p>
            {/if}
		</Wrapper>
	</div>
</Flex>
