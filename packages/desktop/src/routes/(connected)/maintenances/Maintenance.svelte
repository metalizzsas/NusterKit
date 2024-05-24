<script lang="ts">
    import type { MaintenanceHydrated } from "@metalizzsas/nuster-turbine/types/hydrated";
	import Flex from "$lib/components/layout/flex.svelte";
	import { _, date, time } from "svelte-i18n";
	import SvelteMarkdown from "svelte-markdown";
	import { beforeUpdate } from "svelte";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { WrenchScrewdriver } from "@steeze-ui/heroicons";
	import MaintenanceImageParser from "./MaintenanceImageParser.svelte";
	import Button from "$lib/components/buttons/Button.svelte";
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/stores";
	import { enhance } from "$app/forms";

    export let maintenance: MaintenanceHydrated;

    let procedureMarkdown: string | undefined;

    beforeUpdate(async () => {

        const req = await fetch(`/files/docs/maintenance-${maintenance.name}/${$page.data.settings.lang}.md`);

        if(req.status !== 404)
            procedureMarkdown = await req.text();
    });

</script>

<Flex direction="col" gap={2}>
    <h1>{$_('maintenance.tasks.' + maintenance.name + '.name')}</h1>
    <p>{$_('maintenance.tasks.' + maintenance.name + '.desc')}</p>
    
    {#if maintenance.operationDate}
        <p class="font-medium">
            {$_('maintenance.last_operation')}: 
            <span class="font-normal">{$date(new Date(maintenance.operationDate), { format: "medium"})} — {$time(new Date(maintenance.operationDate), { format: "medium"})}</span>
        </p>
    {/if}

    <h3 class="leading-10 font-medium"><Icon src={WrenchScrewdriver} class="h-5 w-5 mr-1 inline-block text-indigo-500"/>{$_('maintenance.procedure.lead')}</h3>
    
    {#if procedureMarkdown}
        <div class="markdown">
            <SvelteMarkdown source={procedureMarkdown} renderers={{ image: MaintenanceImageParser }}/>
        </div>
        <form action="?/clearMaintenance" method="post" use:enhance>
            <input type="hidden" name="maintenance_name" value={maintenance.name} />
            <Button>{$_('maintenance.procedure.clear')}</Button>
        </form>
    {:else}
        <p class="text-amber-500">{$_('maintenance.procedure.lang_unavailable')}</p>
    {/if}
</Flex>