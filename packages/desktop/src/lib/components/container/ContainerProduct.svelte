<script lang="ts">
	import type { ContainerHydrated } from "@metalizzsas/nuster-turbine/types/hydrated";

	import Button from "$lib/components/buttons/Button.svelte";
	import Select from "$lib/components/inputs/Select.svelte";
	import Flex from "$lib/components/layout/flex.svelte";
	import Grid from "$lib/components/layout/grid.svelte";
    
	import { ArrowDownTray, ArrowRight } from "@steeze-ui/heroicons";
	import { transformDate } from "$lib/utils/dateparser";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { date, time, _ } from "svelte-i18n";
	import { enhance } from "$app/forms";

    export let container: ContainerHydrated;

    let methods: string[] = []; 

    let selectedProduct: string | undefined = undefined;
    let selectedMethod: string | undefined = undefined;

    $: methods = [
        container.isProductable ? "load" : undefined,
        ...(container.callToAction ?? []).map(cta => cta.name),
        container.isProductable ? "unload" : undefined
    ].filter(k => k !== undefined).filter((k, i, a) => a.indexOf(k) === i);
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
                {$date(Date.parse(container.productData.loadDate), { format: "medium"})} — {$time(Date.parse(container.productData.loadDate), {format: "medium"})}.
            </p>
            <p>
                <span class="font-medium">{$_('container.product.informations.lifetime_remaining')}</span>
                {transformDate($_, container.productData.lifetimeRemaining)}.
            </p>
        </section>
    {/if}

    <section>

        <h4 class="leading-10 font-semibold text-base">{$_('container.product.action.lead')}</h4>

        {#if selectedMethod === undefined}
            <Grid cols={1} gap={4}>
                {#each methods as method}
                    {@const needProduct = method !== "unload"}
                    {@const cta = container.callToAction.find(c => c.name === method)}

                    {#if cta !== undefined || needProduct === false}
                        <form action="?/updateContainerProduct" method="post" use:enhance>
                            <input type="hidden" name="action_type" value={cta?.name || method} />
                            <Button 
                                class="w-full"
                                ringColor={`${method === "unload" ? "ring-red-500" : (method === "load" ? "ring-emerald-500" : 'ring-amber-500')}`}
                                color={`${method === "unload" ? "hover:bg-red-500" : (method === "load" ? "hover:bg-emerald-500" : 'hover:bg-amber-500')}`}
                            >
                                <Flex direction="row" justify="center" items="center">
                                    <Icon src={ArrowDownTray} class="h-4 w-4"/>
                                    {$_(`containers.${container.name}.actions.${cta?.name || method}`)}
                                </Flex>
                            </Button>
                        </form>
                    {:else}
                        <Button 
                            on:click={() => selectedMethod = method }
                            ringColor={`${method === "unload" ? "ring-red-500" : (method === "load" ? "ring-emerald-500" : 'ring-amber-500')}`}
                            color={`${method === "unload" ? "hover:bg-red-500" : (method === "load" ? "hover:bg-emerald-500" : 'hover:bg-amber-500')}`}
                        >
                            <Flex direction="row" justify="center" items="center">
                                <Icon src={ArrowDownTray} class="h-4 w-4"/>
                                {$_(`containers.${container.name}.actions.${method}`)}
                            </Flex>
                        </Button>
                    {/if}
                {/each}
            </Grid>
        {:else if selectedMethod !== undefined}
            <p class="text-zinc-700 dark:text-zinc-300 mb-2">{$_('container.product.action.product_choose')}</p>

            <form action="?/updateContainerProduct" method="post" use:enhance class="grid grid-cols-3 gap-4">
                <input type="hidden" name="action_type" value={selectedMethod} />
                <Select 
                    bind:value={selectedProduct}
                    selectableValues={container.supportedProductSeries.map(k => { return { 
                        name: $_(`container.product.informations.product_series.${k}`), 
                        value: k
                    }})}
                    class="w-full"
                    form={{ name: "product" }}
                />

                <Button 
                    class="w-full"
                    color="{selectedProduct === undefined ? 'hover:bg-gray-500' : 'hover:bg-amber-500'}"
                    ringColor="{selectedProduct === undefined ? 'ring-gray-500' : 'ring-amber-500'}"
                >
                    <Flex gap={2} items="center">
                        {$_(`containers.${container.name}.actions.${selectedMethod}`)}
                        <Icon src={ArrowRight} class="h-4 w-4" />
                    </Flex>
                </Button>

                <Button 
                    class="w-full"
                    color="hover:bg-red-500"
                    ringColor="ring-red-500"
                    on:click={() => selectedMethod = undefined}
                >
                    {$_('cancel')}
                </Button>
            </form> 
        {/if}
    </section>
</Flex>