<script lang="ts">

	import { computeContainersState, computeMaintenancesState } from "$lib/utils/state";

	import Flex from "$lib/components/layout/flex.svelte";
	import { onMount } from "svelte";
	import { realtime } from "$lib/utils/stores/nuster";
	import { _ } from "svelte-i18n";
	import type { Configuration } from "@metalizzsas/nuster-typings";
	import PillMenuButton from "./PillMenuButton.svelte";

    let containersState: "good" | "warn" | "error" | "info" = "error";

    let maintenancesState: "good" | "warn" | "error" = "error";

    let machine: Configuration | undefined;

    onMount(async () => {

        const machineRequest = await fetch(`/api/machine`);
        machine = await machineRequest.json() as Configuration;

    });

    /// Reactive statements
    $: maintenancesState = computeMaintenancesState($realtime.maintenance);
    $: containersState = computeContainersState($realtime.containers, $realtime.io).result;

</script>

<Flex justify="between" gap={2} items="center" class="text-zinc-800 dark:text-white">

    <a href="/">
        <Flex gap={4} items="center" class="ml-2">
            <img src="/icons/icon-t-192.png" class="h-12 -m-2 -ml-1 aspect-square" alt={$_('nuster.logo')}/>
            <h1 class="text-xl">{$_('nuster.lead')}</h1>
        </Flex>
    </a>

    <div class="h-[1px] bg-zinc-500/50 grow mx-2" />

    <PillMenuButton href="/" activeUrl="/(connected)" exclusiveURL>
        {$_('cycle.lead')}
        {#if $realtime.cycle}
            <div 
                class="h-2.5 aspect-square rounded-full"
                class:bg-blue-500={$realtime.cycle?.status.mode !== "started"}
                class:bg-green-500={$realtime.cycle?.status.mode === "started"}
                class:animate-pulse={$realtime.cycle?.status.mode === "started"}
            />
        {/if}
    </PillMenuButton>

    {#if machine !== undefined && (machine?.settings.profilesShown === true || machine.settings.devMode === true)}
        <PillMenuButton href="/profiles" activeUrl="/(connected)/profiles">{$_('profile.lead')}</PillMenuButton>
    {/if}

    <PillMenuButton href="/containers" activeUrl="/(connected)/containers">
        {$_('container.lead')}
        <div 
            class="h-2.5 aspect-square rounded-full"
            class:bg-red-500={containersState === "error"}
            class:bg-amber-500={containersState === "warn"}
            class:bg-emerald-500={containersState === "good"}
            class:bg-blue-500={containersState === "info"}
            class:animate-pulse={containersState !== "good"}
        />
    </PillMenuButton>

    <PillMenuButton href="/maintenances" activeUrl={"/(connected)/maintenances"}>
        {$_('maintenance.lead')}
        <div 
            class="h-2.5 aspect-square rounded-full"
            class:bg-red-500={maintenancesState === "error"}
            class:bg-amber-500={maintenancesState === "warn"}
            class:bg-emerald-500={maintenancesState === "good"}
            class:animate-pulse={maintenancesState !== "good"}
        />
    </PillMenuButton>

    <PillMenuButton href="/help" activeUrl={"/(connected)/help"}>{$_('help.lead')}</PillMenuButton>

    {#if machine?.settings.devMode === true}
        <PillMenuButton href="/io" activeUrl={"/(connected)/io"}>{$_('gates.lead')}</PillMenuButton>
    {/if}

    <PillMenuButton href="/settings" activeUrl={"/(connected)/settings"}>{$_('settings.lead')}</PillMenuButton>

</Flex>