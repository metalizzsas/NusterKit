<script lang="ts">
	import Flex from "$lib/components/layout/flex.svelte";
	import type { MaintenanceHydrated } from "@metalizzsas/nuster-typings/build/hydrated";
	import { ArrowsPointingIn, ArrowsPointingOut } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { getContext } from "svelte";

    export let href = '';
    export let title: string | undefined = undefined;
    export let text = '';

    const { maintenance } = getContext<{maintenance: MaintenanceHydrated}>("task");

    let expanded = false;

    $: expanded, console.log("expanded", expanded);

</script>

<Flex direction="row" items="center" justify="center">
    <div style:max-width={expanded ? '100%' : '66%'} class="relative duration-300">
        <img 
            src={`/api/assets/maintenance/${maintenance.name}/${href}`}  
            {title} 
            alt={text} 
            class="my-1 border-[1px] border-indigo-500/50 rounded-md mx-auto duration-300"
        >
        <button on:click={() => expanded = !expanded} class="absolute bottom-6 right-6" name="Expand image">
            <Icon src={!expanded ? ArrowsPointingOut : ArrowsPointingIn} class="h-8 w-8 text-zinc-800 bg-white rounded-md p-1 border border-zinc-500" />
        </button>
    </div>
</Flex>