<script lang="ts">
	import type { ContainerHydrated, IOGatesHydrated } from "@metalizzsas/nuster-typings/build/hydrated";

	import Flex from "$lib/components/layout/flex.svelte";
	import Gate from "../io/Gate.svelte";

	import { ChevronDown, ChevronUp } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";

	import { realtime } from "$lib/utils/stores/nuster";

	import { afterUpdate } from "svelte";
	import { _ } from "svelte-i18n";
	import { computeContainersState } from "$lib/utils/state";
	import ContainerRegulation from "./ContainerRegulation.svelte";
	import ContainerProduct from "./ContainerProduct.svelte";

    export let container: ContainerHydrated;

    type categoriesTypes = "products" | "sensors" | "regulation";

    let categories: Array<categoriesTypes> = [];
    let expandedCategory: categoriesTypes | undefined  = undefined;

    let sensorIO: Array<IOGatesHydrated> = [];

    const sensorIOFilter = (k: IOGatesHydrated | undefined): k is IOGatesHydrated => { return k !== undefined }; 
        
    afterUpdate(() => {

        categories = [];

        if(container.isProductable || ((container.callToAction?.length ?? 0) > 0)) categories = [...categories, "products"];
        if(container.sensors) categories = [...categories, "sensors"];
        if(container.regulations) categories = [...categories, "regulation"];

        containerState = computeContainersState(container, $realtime.io);
            
    });

    /// — Reactivity statements

    $: if(container.sensors) { $realtime.io, sensorIO = container.sensors.map(s => $realtime.io.find(i => i.name == s.io)).filter(sensorIOFilter); }
    $: containerState = computeContainersState(container, $realtime.io);

</script>

<Flex direction="col" gap={2}>
    <h2 class="text-xl">{$_(`containers.${container.name}.name`)}</h2>

    {#if containerState.issues.length > 0}
        <div>
            <p>{$_('container.state.lead.error')}</p>
            <ul>
                {#each containerState.issues as error}
                    <li>{$_(`container.state.issues.${error}`)}</li>
                {/each}
            </ul>
        </div>
    {:else}
        <p>{$_('container.state.lead.good')}</p>
    {/if}


    <Flex direction="col" gap={0} class="-mx-6 -mb-6">
    
        {#each categories as category}

            {@const selected = expandedCategory === category}
            <button 
                class="duration-300 py-2 px-6"

                class:bg-zinc-200={selected}
                class:dark:bg-zinc-700={selected}
                class:hover:bg-zinc-100={selected}
                class:dark:hover:bg-zinc-600={selected}
                
                class:hover:bg-zinc-300={!selected}
                class:dark:hover:bg-zinc-700={!selected}

                class:last-of-type:rounded-b-xl={expandedCategory !== category}

                on:click={() => { if(expandedCategory === category) { expandedCategory = undefined } else { expandedCategory = category }}}
            >
                <Flex direction={"row"} items="center">
                    <h3>
                        {$_(`container.category.${category}`)}
                        {#if category === "sensors"}
                            <span class="text-xs font-normal">({container.sensors?.length})</span>
                        {/if}
                    </h3>
                    <div class="h-[1px] bg-indigo-500/50 w-auto grow" />
                    <Icon src={expandedCategory === category ? ChevronUp : ChevronDown} class="h-4 w-4" />
                </Flex>
            </button>

            <div 
                class="duration-100"
                class:h-0={expandedCategory !== category}
                class:m-4={expandedCategory === category}
                class:px-2={expandedCategory === category}
                class:overflow-hidden={expandedCategory !== category}
            >
                {#if expandedCategory === "products"}
                    <ContainerProduct bind:container />
                {:else if expandedCategory === "sensors"}
                    <Flex direction="col" gap={2}>
                        {#each sensorIO as gate}
                            <Gate bind:io={gate} editable={false} />
                        {/each}
                    </Flex>
                {:else if expandedCategory === "regulation" && container.regulations !== undefined}
                    <ContainerRegulation bind:container />
                {/if}
            </div>
        {/each}
    </Flex>
</Flex>
