<script lang="ts">
	
	import { Icon } from '@steeze-ui/svelte-icon';
	import Flex from '$lib/components/layout/flex.svelte';
	import SelectableButton from '$lib/components/buttons/SelectableButton.svelte';
	import Wrapper from '$lib/components/Wrapper.svelte';
	import SvelteMarkdown from 'svelte-markdown';
	import HelpImageParser from './HelpImageParser.svelte';
	import { BookOpen, Folder } from '@steeze-ui/heroicons';

	import { addMessages, _ } from 'svelte-i18n';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { lang } from '$lib/utils/stores/settings';

	export let data: PageData;

    let selectedHelp: string | undefined;
    let helpContent: string | undefined;

    onMount(async () => {

        for(const l of data.langs)
        {
            const r = await fetch(`/help${l.filename}`);
            if(r.ok && r.status === 200)
                addMessages(l.lang, await r.json() as {})
        }

        const index = helpFiles.find(k => k.name == "index" && k.folder == undefined);
        selectedHelp = index?.filename;
    });

	/// — Reactive statements
    $: if(selectedHelp !== undefined) { 
        fetch(`/help${selectedHelp}`).then(r => r.text().then(c => helpContent = c));
    } else { helpContent = undefined }

    $: helpFiles = data.files.filter(k => k.lang == $lang);

</script>

<Flex direction="row">
	<div class="overflow-y-scroll drop-shadow-xl duration-300 grow">
        <Wrapper>
            {#if helpFiles.length === 0}
                <h3 class="text-amber-500">{$_('help.unavailable')}</h3>
            {/if}
            <Flex direction="col" gap={1}>
                {#each Array.from(new Set(helpFiles.map(k => k.folder).sort((a, b) => { let a2 = a || ''; let b2 = b || ''; return a2.localeCompare(b2) }))) as folder}
                    {#if folder !== undefined}
                        <h3 class="my-1">
                            <Icon src={Folder} class="h-6 w-6 text-indigo-500 inline mr-1" />
                            {$_(`help.folders.${folder}`)}
                        </h3>
                    {:else}
                        <div class="h-[1px] bg-zinc-300/50 my-2" />
                    {/if}
                    {#each helpFiles.filter(k => k.folder == folder) as helpFile (helpFile.filename)}
                        <SelectableButton 
                            selected={helpFile.filename === selectedHelp}
                            on:click={() => {
                                if(selectedHelp === helpFile.filename) {
                                    selectedHelp = undefined;
                                } else {
                                    selectedHelp = helpFile.filename;
                                }
                            }}
                        >
                            <h4 class="leading-6 text-start">
                                <Icon src={BookOpen} class="h-6 w-6 text-indigo-500 inline mr-1"/>
                                {$_(`help.files.${helpFile.folder !== undefined ? `${helpFile.folder}_` : ''}${helpFile.name}`)}
                            </h4>
                        </SelectableButton>
                    {/each}
                {/each}
            </Flex>
        </Wrapper>
	</div>

	<div class="overflow-y-scroll grow drop-shadow-xl max-w-[66%]">
        <Wrapper>
            {#if selectedHelp !== undefined && helpContent !== undefined}
            <SvelteMarkdown source={helpContent} renderers={{ image: HelpImageParser}} />
            {:else}
			    <h1>{$_('help.unselected.lead')}</h1>
                <p>{$_('help.unselected.sub')}</p>
            {/if}
		</Wrapper>
	</div>
</Flex>
