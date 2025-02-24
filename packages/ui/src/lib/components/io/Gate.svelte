<script lang="ts">

    import type { IOGatesHydrated } from "@nuster/turbine/types/hydrated";
	import Flex from "$lib/components/layout/flex.svelte";
	import Toggle from "$lib/components/inputs/Toggle.svelte";
	import { _ } from "svelte-i18n";
	import Label from "$lib/components/Label.svelte";
	import NumField from "$lib/components/inputs/NumField.svelte";
	import Button from "$lib/components/buttons/Button.svelte";
	import { enhance } from "$app/forms";

    export let io: IOGatesHydrated;
    export let editable = true;

    // TODO: Check why it sends the order twice

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

    <form action="?/editGateValue" method="post" use:enhance>
        <input type="hidden" name="gate" value={io.name} />
        {#if io.size === "bit"}
            <Toggle bind:value={io.value} locked={!editable || io.bus == "in" || io.locked} enableGrayScale={io.locked} form={{ name: "value", validateOn: "change" }}/>
        {:else}
            <Flex class="items-center">
                <Label>
                    {io.value}
                    {#if io.unity}
                        <span class="font-medium">{io.unity}</span>
                    {/if}
                </Label>

                {#if editable === true}
                    <Button ringColor={"ring-amber-500"} color={"hover:bg-amber-500"} size={"small"} on:click={() => { io.value = 0; }}>{$_('gates.reset')}</Button>
                    <NumField 
                        bind:value={io.value} 
                        min={io.type == "mapped" ? io.mapOutMin : 0}
                        max={io.type == "mapped" ? io.mapOutMax : 100}
                        step={io.type == "mapped" ? 0.01 : 1}
                        name="value"
                        validateOnChange
                    />
                {/if}
            </Flex>
        {/if}
    </form>
</Flex>