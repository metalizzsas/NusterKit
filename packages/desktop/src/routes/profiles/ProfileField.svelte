<script lang="ts">
	import Flex from "$lib/components/layout/flex.svelte";
	import NumField from "$lib/components/inputs/NumField.svelte";
	import TimeField from "$lib/components/inputs/TimeField.svelte";
	import Toggle from "$lib/components/inputs/Toggle.svelte";

    import type { ProfileHydrated } from "@metalizzsas/nuster-typings/build/hydrated";
	import { _ } from "svelte-i18n";
	import Label from "$lib/components/label.svelte";
    
    export let field: ProfileHydrated["values"][number];

    export let disabled: boolean = false;

</script>

<Flex items="center">
    <span>{$_(`profile.rows.${field.name.split("#")[1]}`)}</span>

    <div class="h-[1px] bg-zinc-500 grow" />

    {#if field.type == 'bool'}
        <Toggle bind:value={field.value} on:changeNum={(e) => field.value = e.detail.value} locked={disabled} />
    {:else if field.type == 'int'}
        <NumField bind:value={field.value} {disabled} />
    {:else if field.type == "time"}
        <TimeField bind:value={field.value} {disabled} />
    {:else if field.type == 'float'}
            <Flex gap={2} items="center">
                <Label>{field.value} <span class="font-semibold">{field.unity}</span></Label>
                <input
                    type="range"
                    class="min-w-[17vw]"
                    bind:value={field.value}
                    min={field.floatMin}
                    max={field.floatMax}
                    step={field.floatStep ?? 1}
                    {disabled}
                />
            </Flex>
    {/if}
</Flex>