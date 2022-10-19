<script lang="ts">
	import type { ISlotHydrated } from "@metalizzsas/nuster-typings/build/hydrated/slot";
	import type { EProductSeries } from "@metalizzsas/nuster-typings/build/spec/slot/products";
	import Actionmodal from "../modals/actionmodal.svelte";
    import { _ } from "svelte-i18n";
	import Button from "../button.svelte";
	import Flex from "../layout/flex.svelte";
    import { Linker } from "$lib/utils/stores/linker";
	import { execCTA } from "$lib/utils/callToAction";
	import { goto } from "$app/navigation";
	import Modal from "../modals/modal.svelte";

    export let shown = false;
    export let slot: ISlotHydrated;

    /** produit sélectionné, si une seul product series supportées alors c'est automatiquement selectionné {@link l22 $:} */
    let selectedProduct: EProductSeries;

    //Default = chargement manual, autre = CTA
    let selectedMethod: 'default' | string = 'default';

    const load = async () => {
        if(selectedMethod != "default" && slot.callToAction !== undefined)
        {
            const cta = slot.callToAction.find(c => c.name == selectedMethod);

            if(cta !== undefined)
            {
                const ctaResult = await execCTA($Linker, cta);

                if(ctaResult !== undefined)
                {
                    void goto(ctaResult)
                    shown = false;
                    return;
                }
            }
        }
        else
        {
            if(slot.supportedProductSeries?.includes(selectedProduct as EProductSeries))
			    void fetch(`//${$Linker}/api/v1/slots/${slot.name}/load/${selectedProduct}`, { method: 'post' });
        }

        shown = false;
    };

    $: if(slot.supportedProductSeries !== undefined && slot.supportedProductSeries.length == 1) { selectedProduct = slot.supportedProductSeries[0] }

</script>

<Actionmodal bind:shown zIndex={150}>
    <Flex direction={"col"} gap={3}>
        <h2 class="text-xl leading-6 text-cente self-start">{$_('slots.modal.load')}</h2>
        {#if slot.supportedProductSeries !== undefined && slot.supportedProductSeries.length > 1}
            <Flex direction={"col"} gap={1}>
                <p>{$_(`slots.modal.chooseProductToLoad`)}</p>
        
                <select bind:value={selectedProduct} class="p-1.5 text-zinc-800 bg-zinc-300 font-medium">
                    {#each slot.supportedProductSeries as serie}
                        <option value={serie}>{$_(`products.${serie}`)}</option>
                    {/each}
                </select>
            </Flex>
        {/if}
        {#if slot.callToAction !== undefined && slot.callToAction.filter(c => c.name.startsWith("load")).length > 0}
            <Flex direction={"col"} gap={1}>
                <p>{$_(`slot.modal.chooseLoadingMethod`)}</p>
        
                <select bind:value={selectedMethod} class="p-1.5 text-zinc-800 bg-zinc-300 font-medium">
                    <option value={'default'} selected>{$_(`slots.modal.defaultLoadMethod`)}</option>
                    {#each slot.callToAction.filter(c => c.name.startsWith("load")) as method}
                        <option value={method.name}>{$_(`slots.modal.actions.${slot.name}.${method.name}`)}</option>
                    {/each}
                </select>
            </Flex>
        {/if}
        <Button on:click={load}>{$_("slots.modal.load")}</Button>
    </Flex>
</Actionmodal>