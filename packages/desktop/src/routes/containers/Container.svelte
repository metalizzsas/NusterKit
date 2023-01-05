<script lang="ts">
	import type { ContainerHydrated, IOGatesHydrated } from "@metalizzsas/nuster-typings/build/hydrated";

	import Flex from "$lib/components/layout/flex.svelte";
	import Grid from "$lib/components/layout/grid.svelte";
	import Button from "$lib/components/buttons/Button.svelte";
	import Gate from "../io/Gate.svelte";

	import { ArrowDownTray, ArrowRight, ArrowUpTray, ChevronDown, ChevronUp } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";

	import { realtime } from "$lib/utils/stores/nuster";

	import { afterUpdate } from "svelte";
	import { date, time, _ } from "svelte-i18n";
	import { computeContainersState } from "$lib/utils/state";
	import type { ProductSeries } from "@metalizzsas/nuster-typings/build/spec/containers/products";
	import { executeCallToAction } from "$lib/utils/callToAction";
	import { transformDate } from "$lib/utils/dateparser";
	import Select from "$lib/components/inputs/Select.svelte";
	import { page } from "$app/stores";
	import Toggle from "$lib/components/inputs/Toggle.svelte";
	import NumField from "$lib/components/inputs/NumField.svelte";
	import Label from "$lib/components/Label.svelte";

    export let container: ContainerHydrated;

    type categoriesTypes = "products" | "sensors" | "regulation";

    let categories: Array<categoriesTypes> = [];
    let expandedCategory: categoriesTypes | undefined  = undefined;

    let sensorIO: Array<IOGatesHydrated> = [];

    /// - Product loading states
    let compatibleProductListShown = false;
    let selectedProduct: ProductSeries | undefined = undefined;
    let selectedProductAlert = false;
    let preselectedMethod: string | undefined = undefined;

    const sensorIOFilter = (k: IOGatesHydrated | undefined): k is IOGatesHydrated => { return k !== undefined }; 
        
    afterUpdate(() => {

        categories = [];

        if(container.isProductable)
            categories = [...categories, "products"];

        if(container.sensors)
            categories = [...categories, "sensors"];

        if(container.regulations)
            categories = [...categories, "regulation"];
            
    });

    const productEdit = async (name: string) => {

        preselectedMethod = name;

        if(!name.includes("unload"))
        {
            if((container.supportedProductSeries?.length ?? 0) > 1)
            {
                if(compatibleProductListShown === false)
                {
                    compatibleProductListShown = true;
                    return;
                }
        
                if(selectedProduct === undefined)
                {
                    selectedProductAlert = true;
                    return;
                }
            }
            else
                selectedProduct = container.supportedProductSeries?.at(0);
        }

        const callToAction = container.callToAction?.find(k => k.name == name);

        if(callToAction === undefined)
        {
            await fetch(`${$page.data.nuster_api_host}/api/v1/containers/${container.name}/${name}/${selectedProduct ?? ''}`, { method: "post" });
        }
        else
            executeCallToAction($page.data.nuster_api_host, callToAction);

        // hide compatible product list
        compatibleProductListShown = false;
        selectedProduct = undefined;
    }

    const toggleRegulation = async (sensor: string, state: boolean) => {
        await fetch(`${$page.data.nuster_api_host}/api/v1/containers/${container.name}/regulation/${sensor.replace("#", "_")}/state/${state}`, { method: 'post' });
    }

    const setRegulation = async (sensor: string, target: number) => {
        await fetch(`${$page.data.nuster_api_host}/api/v1/containers/${container.name}/regulation/${sensor.replace("#", "_")}/target/${target}`, { method: 'post' });
    }

    afterUpdate(() => {
        containerState = computeContainersState(container, $realtime.io);
    })

    /// — Reactivity statements

    $: if(container.sensors) { $realtime.io, sensorIO = container.sensors.map(s => $realtime.io.find(i => i.name == s.io)).filter(sensorIOFilter); }
    $: containerState = computeContainersState(container, $realtime.io);
    $: if(selectedProductAlert === true) { setTimeout(() => { selectedProductAlert = false }, 3000); };

</script>

<Flex direction="col" gap={2}>
    <h2 class="text-xl">{$_('slots.types.' + container.name)}</h2>

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
                class="duration-100 overflow-hidden"
                class:h-0={expandedCategory !== category}
                class:m-4={expandedCategory === category}
                class:px-2={expandedCategory === category}
            >

                {#if expandedCategory == "products"}

                    <Flex direction="col" gap={2}>
                        {#if container.productData !== undefined}
                            <section>
                                <h4 class="leading-10 font-semibold text-base">{$_('container.product.informations.lead')}</h4>
                                <p>
                                    <span class="font-medium">{$_('container.product.informations.loaded_product')}</span>
                                    {$_(`container.product.informations.product_series.${container.productData.loadedProductType}`)}.
                                </p>
                                <p>
                                    <span class="font-medium">{$_('container.product.informations.load_date')}</span>
                                    {$date(Date.parse(container.productData.loadDate))} — {$time(Date.parse(container.productData.loadDate), {format: "medium"})}.
                                </p>
                                <p>
                                    <span class="font-medium">{$_('container.product.informations.lifetime_remaining')}</span>
                                    {transformDate($_, container.productData.lifetimeRemaining, container.productData.loadedProductType)}.
                                </p>
                            </section>
                        {/if}

                        <section>

                            <h4 class="leading-10 font-semibold text-base">{$_('container.product.action.lead')}</h4>

                            {#if compatibleProductListShown === false}

                                <Grid cols={1} gap={4}>
                                    <Button on:click={() => productEdit("load")}>
                                        <Flex direction="row" justify="center" items="center">
                                            <Icon src={ArrowDownTray} class="h-4 w-4"/>
                                            {$_(`container.product.action.${container.name}.load`)}
                                        </Flex>
                                    </Button>

                                    {#if container.callToAction}
                                        {#each container.callToAction.filter(k => k.name !== "load" && k.name !== "unload") as cta}
                                            <Button color="hover:bg-amber-500" ringColor="ring-amber-500" on:click={() => productEdit(cta.name)}>
                                                <Flex direction="row" justify="center" items="center">
                                                    <Icon src={ArrowDownTray} class="h-4 w-4"/>
                                                    {$_(`container.product.action.${container.name}.${cta.name}`)}
                                                </Flex>
                                            </Button>
                                        {/each}
                                    {/if}

                                    <Button ringColor="ring-red-500" color="hover:bg-red-500" on:click={() => productEdit("unload")}>
                                        <Flex direction="row" justify="center" items="center">
                                            <Icon src={ArrowUpTray} class="h-4 w-4"/>
                                            {$_(`container.product.action.${container.name}.unload`)}
                                        </Flex>
                                    </Button>
                                </Grid>

                            {:else if preselectedMethod !== undefined}

                                <p class="text-zinc-700 dark:text-zinc-300 mb-2">{$_('container.product.action.product_choose')}</p>

                                <Flex gap={4}>

                                    <Select bind:value={selectedProduct} class="grow">
                                        {#if container.supportedProductSeries}
                                            <option selected value={undefined}>—</option>
                                            {#each container.supportedProductSeries as series}
                                                <option value={series}>{$_(`container.product.informations.product_series.${series}`)}</option>
                                            {/each}
                                        {/if}
                                    </Select>

                                    <Button 
                                        color="{selectedProduct === undefined ? 'hover:bg-gray-500' : 'hover:bg-amber-500'}"
                                        ringColor="{selectedProduct === undefined ? 'ring-gray-500' : 'ring-amber-500'}"
                                        on:click={() => {
                                            if(preselectedMethod) { 
                                                productEdit(preselectedMethod); 
                                            }
                                        }}
                                    >
                                        <Flex gap={2} items="center">
                                            {$_(`slots.modal.actions.${container.name}.${preselectedMethod}`)}
                                            <Icon src={ArrowRight} class="h-4 w-4" />
                                        </Flex>
                                    </Button>
                                </Flex>
                            {/if}
                        </section>
                    </Flex>
                {/if}

                {#if expandedCategory == "sensors"}
                    <Flex direction="col" gap={2}>
                        {#each sensorIO as gate}
                            <Gate bind:io={gate} editable={false} />
                        {/each}
                    </Flex>
                {/if}

                {#if expandedCategory == "regulation" && container.regulations}

                    {#each container.regulations as regulation}
                        <Flex direction="col" gap={2}>
                            <h3>{$_('container.regulation.names.' + regulation.name)}</h3>

                            <Flex items="center">
                                <span>{$_('container.regulation.enabled')}</span>
                                <div class="h-[1px] grow bg-zinc-500/50" />
                                <Toggle bind:value={regulation.state} on:change={(e) => {
                                    toggleRegulation(regulation.name, e.detail.value);
                                }}/>
                            </Flex>

                            <Flex items="center">
                                <span>{$_('container.regulation.current')}</span>
                                <div class="h-[1px] grow bg-zinc-500/50" />
                                <Label>
                                    {regulation.current}
                                    {#if regulation.currentUnity !== undefined}
                                        <span class="font-medium">{regulation.currentUnity}</span>
                                    {/if}
                                </Label>
                            </Flex>

                            <Flex items="center">
                                <span>{$_('container.regulation.target')}</span>
                                <div class="h-[1px] grow bg-zinc-500/50" />
                                <NumField bind:value={regulation.target} on:change={(e) => {
                                    setRegulation(regulation.name, e.detail.value)
                                }}/>
                            </Flex>
                        </Flex>
                    {/each}
                {/if}
            </div>
        {/each}
    </Flex>
</Flex>
