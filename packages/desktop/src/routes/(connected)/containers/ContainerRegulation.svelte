<script lang="ts">
	import type { ContainerHydrated } from "@metalizzsas/nuster-turbine/types/hydrated";
    import type { Modify } from "@metalizzsas/nuster-turbine/types/utils";

	import Flex from "$lib/components/layout/flex.svelte";
	import { _ } from "svelte-i18n";
	import type { ContainerRegulationHydrated } from "@metalizzsas/nuster-turbine/types/hydrated/containers";
	import Toggle from "$lib/components/inputs/Toggle.svelte";
	import Label from "$lib/components/Label.svelte";
	import NumField from "$lib/components/inputs/NumField.svelte";

    export let container: Modify<ContainerHydrated, { regulations: Array<ContainerRegulationHydrated> }>;

    const toggleRegulation = async (sensor: string, state: boolean) => {
        await fetch(`/api/v1/containers/${container.name}/regulation/${sensor.replace("#", "_")}/state/${state === true ? "true" : "false"}`, { method: 'post' });
    }

    const setRegulation = async (sensor: string, target: number, maxTarget: number) => {

        if(target > maxTarget) target = maxTarget;

        await fetch(`/api/v1/containers/${container.name}/regulation/${sensor.replace("#", "_")}/target/${target}`, { method: 'post' });
    }

</script>

{#each container.regulations as regulation}
    <Flex direction="col" gap={2}>
        <h3>{$_(`containers.${container.name}.regulations.${regulation.name}`)}</h3>

        <Flex items="center">
            <span>{$_('container.regulation.enabled')}</span>
            <div class="h-[1px] grow bg-zinc-500/50" />
            <Toggle bind:value={regulation.state} on:change={(e) => {
                void toggleRegulation(regulation.name, e.detail.value);
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
            <NumField bind:value={regulation.target} max={regulation.maxTarget} on:change={(e) => {
                void setRegulation(regulation.name, e.detail.value, regulation.maxTarget)
            }}/>
        </Flex>
    </Flex>
{/each}