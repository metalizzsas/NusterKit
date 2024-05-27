<script lang="ts">
	import Flex from "$lib/components/layout/flex.svelte";
	import NumField from "$lib/components/inputs/NumField.svelte";
	import TimeField from "$lib/components/inputs/TimeField.svelte";
	import Toggle from "$lib/components/inputs/Toggle.svelte";

    import type { ProfileHydrated } from "@nuster/turbine/types/hydrated";
	import { _ } from "svelte-i18n";
	import Label from "$lib/components/Label.svelte";
	import Button from "$lib/components/buttons/Button.svelte";
	import { Minus, Plus } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";
    
    export let field: ProfileHydrated["values"][number];

    export let disabled = false;

</script>

<Flex items="center">
    <span>{$_(`profile.rows.${field.name.split("#")[1]}`)}</span>

    <div class="h-[1px] bg-zinc-500 grow" />

    {#if field.type == 'bool'}
        <Toggle bind:value={field.value} on:changeNum={(e) => field.value = e.detail.value} locked={disabled} />
    {:else if field.type == 'int'}
        <NumField bind:value={field.value} {disabled} />
    {:else if field.type == "time"}
        <TimeField bind:value={field.value} enabledTimes={field.units} {disabled} />
    {:else if field.type == 'float'}
        <Flex gap={2} items="center">
            <NumField bind:value={field.value} min={field.floatMin} max={field.floatMax} step={field.floatStep} />
            <Label>{field.value} <span class="font-semibold">{field.unity}</span></Label>
        </Flex>
    {:else if field.type == "incremental"}
        <Flex items="center">
            <Button on:click={() => {
                if(disabled) return;
                if(field.baseValue + field.value >= field.incrementalRangeMax) return;
                field.value = field.value + 1
            }} disabled={disabled}>
                <Icon src={Plus} class="h-4 w-4" />
            </Button>
            
            <p>Offset: <span class="font-bold">{field.value}</span></p>

            <Button on:click={() => {
                if(disabled) return;
                if(field.baseValue + field.value <= field.incrementalRangeMin) return;
                field.value = field.value - 1
            }} disabled={disabled}>
                <Icon src={Minus} class="h-4 w-4" />
            </Button>
        </Flex>
    {/if}
</Flex>