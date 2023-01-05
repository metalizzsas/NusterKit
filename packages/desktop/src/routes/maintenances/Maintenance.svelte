<script lang="ts">
	import Flex from "$lib/components/layout/flex.svelte";

    import type { MaintenanceHydrated } from "@metalizzsas/nuster-typings/build/hydrated";
	import { _ } from "svelte-i18n";
	import SvelteMarkdown from "svelte-markdown";
	import { onMount } from "svelte";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { WrenchScrewdriver } from "@steeze-ui/heroicons";
	import MaintenanceImageParser from "./MaintenanceImageParser.svelte";
	import { setContext } from "svelte";
	import Button from "$lib/components/buttons/Button.svelte";
	import { invalidate } from "$app/navigation";
	import { lang } from "$lib/utils/stores/settings";
	import { page } from "$app/stores";

    export let maintenance: MaintenanceHydrated;

    let procedureMarkdown: string | undefined;

    onMount(async () => {
        const req = await fetch(`${$page.data.nuster_api_host}/api/assets/maintenance/${maintenance.name}/index-${$lang}.md`);

        if(req.status !== 404)
            procedureMarkdown = await req.text();
    });

    /// — Set context to use in image parser
    setContext<{ maintenance: MaintenanceHydrated }>("task", {
        maintenance: maintenance
    });

    const clearMaintenance = async () => {
        await fetch(`${$page.data.nuster_api_host}/api/v1/maintenances/${maintenance.name}`, { method: "delete"} );
        invalidate(() => true);
    }

</script>

<Flex direction="col" gap={2}>
    <h1>{$_('maintenance.tasks.' + maintenance.name + '.name')}</h1>
    <p>{$_('maintenance.tasks.' + maintenance.name + '.desc')}</p>

    <h3 class="leading-10 font-medium"><Icon src={WrenchScrewdriver} class="h-5 w-5 mr-1 inline-block text-indigo-500"/>{$_('maintenance.procedure.lead')}</h3>
    
    {#if procedureMarkdown}
        <SvelteMarkdown source={procedureMarkdown} renderers={{ image: MaintenanceImageParser }}/>
        <Button on:click={clearMaintenance}>{$_('maintenance.procedure.clear')}</Button>
    {:else}
        <p class="text-amber-500">{$_('maintenance.procedure.lang_unavailable')}</p>
    {/if}
</Flex>