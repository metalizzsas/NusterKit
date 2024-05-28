<script lang="ts">
	import Flex from "$lib/components/layout/flex.svelte";
	import { _, date, time } from "svelte-i18n";
	import SvelteMarkdown from "svelte-markdown";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { WrenchScrewdriver } from "@steeze-ui/heroicons";
	import MaintenanceImageParser from "$lib/components/markdown/MaintenanceImageParser.svelte";
	import Button from "$lib/components/buttons/Button.svelte";
	import { enhance } from "$app/forms";
	import type { ActionData, PageData } from "./$types";
	import Wrapper from "$lib/components/Wrapper.svelte";

    export let data: PageData;
    export let form: ActionData;

    $: if(form?.clearMaintenance.success === true) { document.getElementsByTagName("main").item(0)?.scrollTo({ top: 0, behavior: "smooth" }); form = null; }

</script>

<Wrapper>
    <Flex direction="col" gap={2}>
        <h1>{$_('maintenance.tasks.' + data.maintenance.name + '.name')}</h1>
        <p>{$_('maintenance.tasks.' + data.maintenance.name + '.desc')}</p>
        
        {#if data.maintenance.operationDate}
            <p class="font-semibold text-amber-500">
                {$_('maintenance.last_operation')}: 
                <span class="font-normal">{$date(new Date(data.maintenance.operationDate), { format: "medium"})} — {$time(new Date(data.maintenance.operationDate), { format: "medium"})}</span>
            </p>
        {/if}
    
        <h3 class="leading-10 font-medium"><Icon src={WrenchScrewdriver} class="h-5 w-5 mr-1 inline-block text-indigo-500"/>{$_('maintenance.procedure.lead')}</h3>
        
        {#if data.maintenanceContent}
            <div class="markdown">
                <SvelteMarkdown source={data.maintenanceContent} renderers={{ image: MaintenanceImageParser }}/>
            </div>
            <form action="?/clearMaintenance" method="post" use:enhance>
                <input type="hidden" name="maintenance_name" value={data.maintenance.name} />
                <Button>{$_('maintenance.procedure.clear')}</Button>
            </form>
        {:else}
            <p class="text-amber-500">{$_('maintenance.procedure.lang_unavailable')}</p>
        {/if}
    </Flex>
</Wrapper>