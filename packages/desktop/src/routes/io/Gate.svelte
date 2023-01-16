<script lang="ts">

    import type { IOGatesHydrated } from "@metalizzsas/nuster-typings/build/hydrated";
	import Flex from "$lib/components/layout/flex.svelte";
	import Toggle from "$lib/components/inputs/Toggle.svelte";
	import { _ } from "svelte-i18n";
    import { realtimeLock } from "$lib/utils/stores/nuster";
	import Label from "$lib/components/Label.svelte";

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
        <Flex>
            <Label>
                {io.value}
                {#if io.unity}
                    <span class="font-medium">{io.unity}</span>
                {/if}
            </Label>

            {#if editable === true}
                <input
                    type="range"
                    class="max-w-[17vw] min-w-[15vw]"
                    min={io.type == "mapped" ? io.mapOutMin : 0}
                    max={io.type == "mapped" ? io.mapOutMax : 100}
                    bind:value={io.value}
                    on:input|self={(ev) => {
                        $realtimeLock = true;
                        io.value = parseInt(ev.currentTarget.value);
                    }}
                    on:change={async () => {
                        $realtimeLock = false;
                        void editGate(io.value);
                    }}
                />
            {/if}
        </Flex>
    {/if}
</Flex>