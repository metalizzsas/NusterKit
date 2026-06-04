<script lang="ts">
	import Flex from "$lib/components/layout/flex.svelte";
	import NumField from "$lib/components/inputs/NumField.svelte";
	import TimeField from "$lib/components/inputs/TimeField.svelte";
	import { Switch } from "$lib/components/ui/switch/index.js";

    import type { ProfileHydrated } from "$lib/api/types";
	import { _ } from "svelte-i18n";
	import Label from "$lib/components/Label.svelte";
	import Button from "$lib/components/buttons/Button.svelte";
	import { Minus, Plus } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";

    let {
        field = $bindable(),
        disabled = false,
        compact = false,
    }: {
        field: ProfileHydrated["values"][number];
        disabled?: boolean;
        /** When true, render only the input (no label or separator). The parent controls the label. */
        compact?: boolean;
    } = $props();
</script>

{#if compact}
    {#if field.type == 'bool'}
        <Switch
            checked={Boolean(field.value)}
            onCheckedChange={(next) => { field.value = (next ? 1 : 0) as typeof field.value; }}
            {disabled}
        />
    {:else if field.type == 'int'}
        <NumField bind:value={field.value} {disabled} />
    {:else if field.type == "time"}
        <TimeField bind:value={field.value} enabledTimes={field.units} {disabled} />
    {:else if field.type == 'float'}
        <Flex gap={2} items="center">
            <NumField bind:value={field.value} min={field.floatMin} max={field.floatMax} step={field.floatStep} {disabled} />
            <Label>{field.value} <span class="font-semibold">{field.unity}</span></Label>
        </Flex>
    {:else if field.type == "incremental"}
        <Flex items="center">
            <Button onclick={() => {
                if (disabled) return;
                if ((field.baseValue ?? 0) + field.value >= (field.incrementalRangeMax ?? Infinity)) return;
                field.value = field.value + 1
            }} {disabled}>
                <Icon src={Plus} class="h-4 w-4" />
            </Button>

            <p>Offset: <span class="font-bold">{field.value}</span></p>

            <Button onclick={() => {
                if (disabled) return;
                if ((field.baseValue ?? 0) + field.value <= (field.incrementalRangeMin ?? -Infinity)) return;
                field.value = field.value - 1
            }} {disabled}>
                <Icon src={Minus} class="h-4 w-4" />
            </Button>
        </Flex>
    {/if}
{:else}

<Flex items="center">
    <span>{$_(`profile.rows.${field.name.split("#")[1]}`)}</span>

    <div class="h-[1px] bg-zinc-500 grow"></div>

    {#if field.type == 'bool'}
        <Switch
            checked={Boolean(field.value)}
            onCheckedChange={(next) => { field.value = (next ? 1 : 0) as typeof field.value; }}
            {disabled}
        />
    {:else if field.type == 'int'}
        <NumField bind:value={field.value} {disabled} />
    {:else if field.type == "time"}
        <TimeField bind:value={field.value} enabledTimes={field.units} {disabled} />
    {:else if field.type == 'float'}
        <Flex gap={2} items="center">
            <NumField bind:value={field.value} min={field.floatMin} max={field.floatMax} step={field.floatStep} {disabled} />
            <Label>{field.value} <span class="font-semibold">{field.unity}</span></Label>
        </Flex>
    {:else if field.type == "incremental"}
        <Flex items="center">
            <Button onclick={() => {
                if (disabled) return;
                if ((field.baseValue ?? 0) + field.value >= (field.incrementalRangeMax ?? Infinity)) return;
                field.value = field.value + 1
            }} {disabled}>
                <Icon src={Plus} class="h-4 w-4" />
            </Button>

            <p>Offset: <span class="font-bold">{field.value}</span></p>

            <Button onclick={() => {
                if (disabled) return;
                if ((field.baseValue ?? 0) + field.value <= (field.incrementalRangeMin ?? -Infinity)) return;
                field.value = field.value - 1
            }} {disabled}>
                <Icon src={Minus} class="h-4 w-4" />
            </Button>
        </Flex>
    {/if}
</Flex>
{/if}
