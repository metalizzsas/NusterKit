<script lang="ts">
	import Button from "$lib/components/buttons/Button.svelte";
	import Select from "$lib/components/inputs/Select.svelte";
	import Flex from "$lib/components/layout/flex.svelte";
	import Grid from "$lib/components/layout/grid.svelte";
	import { executeCallToAction } from "$lib/utils/callToAction";
	import { transformDate } from "$lib/utils/dateparser";
	import type { ContainerHydrated } from "@metalizzsas/nuster-typings/build/hydrated";
	import type { ProductSeries } from "@metalizzsas/nuster-typings/build/spec/containers/products";
	import { ArrowDownTray, ArrowRight, ArrowUpTray } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { afterUpdate } from "svelte";
	import { date, time, _ } from "svelte-i18n";

    export let container: ContainerHydrated;

    /// - Product loading states
    let compatibleProductListShown = false;
    let selectedProduct: ProductSeries | undefined = undefined;
    let preselectedMethod: string | undefined = undefined;

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
            }
            else
                selectedProduct = container.supportedProductSeries?.at(0);
        }

        const callToAction = container.callToAction?.find(k => k.name == name);

        if(callToAction === undefined)
        {
            const product = name === "unload" ? '' : (selectedProduct ?? '');
            await fetch(`/api/v1/containers/${container.name}/${name}/${product}`, { method: "post" });
        }
        else
            void executeCallToAction(callToAction);

        // hide compatible product list
        compatibleProductListShown = false;
    }

    afterUpdate(() => {
        if(container.supportedProductSeries !== undefined)
            selectedProduct = container.supportedProductSeries.at(0);
    });
    
</script>


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

                {#if container.isProductable}
                    <Button on:click={() => productEdit("load")}>
                        <Flex direction="row" justify="center" items="center">
                            <Icon src={ArrowDownTray} class="h-4 w-4"/>
                            {$_(`containers.${container.name}.actions.load`)}
                        </Flex>
                    </Button>
                {/if}

                {#if container.callToAction}
                    {#each container.callToAction.filter(k => k.name !== "load" && k.name !== "unload") as cta}
                        <Button color="hover:bg-amber-500" ringColor="ring-amber-500" on:click={() => productEdit(cta.name)}>
                            <Flex direction="row" justify="center" items="center">
                                <Icon src={ArrowDownTray} class="h-4 w-4"/>
                                {$_(`containers.${container.name}.actions.${cta.name}`)}
                            </Flex>
                        </Button>
                    {/each}
                {/if}

                {#if container.isProductable}
                    <Button ringColor="ring-red-500" color="hover:bg-red-500" on:click={() => productEdit("unload")}>
                        <Flex direction="row" justify="center" items="center">
                            <Icon src={ArrowUpTray} class="h-4 w-4"/>
                            {$_(`containers.${container.name}.actions.unload`)}
                        </Flex>
                    </Button>
                {/if}
            </Grid>

        {:else if preselectedMethod !== undefined && container.supportedProductSeries}

            <p class="text-zinc-700 dark:text-zinc-300 mb-2">{$_('container.product.action.product_choose')}</p>

            <Flex gap={4}>

                <Select 
                    bind:value={selectedProduct}
                    selectableValues={container.supportedProductSeries.map(k => { return { 
                        name: $_(`container.product.informations.product_series.${k}`), 
                        value: k
                    }})}
                    class="grow" 
                />

                <Button 
                    color="{selectedProduct === undefined ? 'hover:bg-gray-500' : 'hover:bg-amber-500'}"
                    ringColor="{selectedProduct === undefined ? 'ring-gray-500' : 'ring-amber-500'}"
                    on:click={() => {
                        if(preselectedMethod) { 
                            void productEdit(preselectedMethod); 
                        }
                    }}
                >
                    <Flex gap={2} items="center">
                        {$_(`containers.${container.name}.actions.${preselectedMethod}`)}
                        <Icon src={ArrowRight} class="h-4 w-4" />
                    </Flex>
                </Button>
            </Flex>
        {/if}
    </section>
</Flex>