<script lang="ts">

    import type { IOGatesHydrated } from "@metalizzsas/nuster-turbine/types/hydrated";
	import Flex from "$lib/components/layout/flex.svelte";
	import Toggle from "$lib/components/inputs/Toggle.svelte";
	import { _ } from "svelte-i18n";
	import Label from "$lib/components/Label.svelte";
	import NumField from "$lib/components/inputs/NumField.svelte";
	import Button from "$lib/components/buttons/Button.svelte";

    export let io: IOGatesHydrated;

    export let editable = true;

    const editGate = async (value: number) => {
        await fetch(`/api/v1/io/${io.name.replace("#", "_")}/${value}`, { method: "post"});
    }

</script>

<Flex items="center">
    <span>
        {$_('gates.names.' + io.name)}
        <span class="text-sm text-zinc-600 dark:text-zinc-400">
            {#if io.locked === true}
                — {$_('locked')}
            {/if}
        </span>
    </span>
    <div class="h-[1px] grow bg-zinc-500/50" />

    {#if io.size === "bit"}
        <Toggle bind:value={io.value} locked={!editable || io.bus == "in" || io.locked} enableGrayScale={io.locked} on:changeNum={(e) => editGate(e.detail.value)}/>
    {:else}
        <Flex class="items-center">
            <Label>
                {io.value}
                {#if io.unity}
                    <span class="font-medium">{io.unity}</span>
                {/if}
            </Label>

            {#if editable === true}
                <Button ringColor={"ring-amber-500"} color={"hover:bg-amber-500"} size={"small"} on:click={() => { void editGate(0) }}>{$_('gates.reset')}</Button>
                <NumField 
                    bind:value={io.value} 
                    min={io.type == "mapped" ? io.mapOutMin : 0}
                    max={io.type == "mapped" ? io.mapOutMax : 100}
                    on:change={(e) => {
                        void editGate(e.detail.value);
                    }} 
                />
            {/if}
        </Flex>
    {/if}
</Flex>