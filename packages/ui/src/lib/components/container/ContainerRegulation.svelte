<script lang="ts">
	import type { ContainerHydrated, Modify, ContainerRegulationHydrated } from "$lib/types/turbine";

	import Flex from "$lib/components/layout/flex.svelte";
	import { _ } from "svelte-i18n";
	import Toggle from "$lib/components/inputs/Toggle.svelte";
	import Label from "$lib/components/Label.svelte";
	import NumField from "$lib/components/inputs/NumField.svelte";
	import { enhance } from "$app/forms";

    let { container = $bindable() }: {
        container: Modify<ContainerHydrated, { regulations: Array<ContainerRegulationHydrated> }>;
    } = $props();
</script>

{#each container.regulations as regulation}
    <Flex direction="col" gap={2}>
        <h3>{$_(`containers.${container.name}.regulations.${regulation.name}`)}</h3>

        <Flex items="center">
            <span>{$_('container.regulation.enabled')}</span>
            <div class="h-[1px] grow bg-zinc-500/50" />
            <form action="?/updateRegulationState" method="post" use:enhance>
                <input type="hidden" name="sensor" value={regulation.name} />
                <Toggle bind:value={regulation.state} form={{ name: "state", validateOn: "change" }}/>
            </form>
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
            <form action="?/updateRegulationTarget" method="post" use:enhance>
                <input type="hidden" name="sensor" value={regulation.name} />
                <NumField bind:value={regulation.target} max={regulation.maxTarget} name="target" validateOnChange />
            </form>
        </Flex>
    </Flex>
{/each}
