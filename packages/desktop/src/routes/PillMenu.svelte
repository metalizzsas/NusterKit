<script lang="ts">

    import type { MaintenanceHydrated } from "@metalizzsas/nuster-typings/build/hydrated";
	import { computeContainersState, computeMaintenancesState } from "$lib/utils/state";

	import Flex from "$lib/components/layout/flex.svelte";
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import { realtime } from "$lib/utils/stores/nuster";
	import { _ } from "svelte-i18n";
	import type { Configuration } from "@metalizzsas/nuster-typings";

    let containersState: "good" | "warn" | "error" | "info" = "error";

    let maintenances: Array<MaintenanceHydrated> = [];
    let maintenancesState: "good" | "warn" | "error" = "error";

    let machine: Configuration | undefined;

    onMount(async () => {
        const maintenancesRequest = await fetch(`${$page.data.nuster_api_host}/v1/maintenances`);
        maintenances = (await maintenancesRequest.json() as Array<MaintenanceHydrated>).filter(m => m.name !== "cycleCount");

        const machineRequest = await fetch(`${$page.data.nuster_api_host}/machine`);
        machine = await machineRequest.json() as Configuration;

    });

    /// Reactive statements
    $: maintenancesState = computeMaintenancesState(maintenances);
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

    <a href="/" class:pillActive={$page.route.id == "/"} class:pillPassive={$page.route.id != "/"}>{$_('cycle.lead')}</a>

    {#if machine !== undefined}
        {#if machine.settings.profilesShown === true || machine.settings.devMode === true}
            <a href="/profiles" class:pillActive={$page.route.id == "/profiles"} class:pillPassive={$page.route.id != "/profiles"}>{$_('profile.lead')}</a>
        {/if}
    {/if}

    <a href="/containers" class:pillActive={$page.route.id == "/containers"} class:pillPassive={$page.route.id != "/containers"}>
        {$_('container.lead')}
        <div 
            class="h-2.5 aspect-square rounded-full"
            class:bg-red-500={containersState === "error"}
            class:bg-amber-500={containersState === "warn"}
            class:bg-emerald-500={containersState === "good"}
            class:bg-blue-500={containersState === "info"}
            class:animate-pulse={containersState !== "good"}
        />
    </a>
    
    <a href="/maintenances" class:pillActive={$page.route.id == "/maintenances"} class:pillPassive={$page.route.id != "/maintenances"}>
        {$_('maintenance.lead')}
        <div 
            class="h-2.5 aspect-square rounded-full"
            class:bg-red-500={maintenancesState === "error"}
            class:bg-amber-500={maintenancesState === "warn"}
            class:bg-emerald-500={maintenancesState === "good"}
            class:animate-pulse={maintenancesState !== "good"}
        />
    </a>

    <a href="/help" class:pillActive={$page.route.id == "/help"} class:pillPassive={$page.route.id != "/help"}>
        {$_('help.lead')}
    </a>

    {#if machine !== undefined}
        {#if machine.settings.devMode === true}
            <a href="/io" class:pillActive={$page.route.id == "/io"} class:pillPassive={$page.route.id != "/io"}>
                {$_('gates.lead')}
            </a>
        {/if}
    {/if}


    <a href="/settings" class:pillActive={$page.route.id?.startsWith("/settings") ?? false} class:pillPassive={$page.route.id?.startsWith("/settings") || true}>{$_('settings.lead')}</a>
</Flex>

<style lang="css">

    .pillActive
    {
        @apply bg-indigo-500 py-1 px-3 rounded-full text-white font-medium flex flex-row gap-2 items-center;
    }

    .pillPassive
    {
        @apply py-1 px-3 ring-2 font-medium ring-transparent ring-inset duration-300 rounded-full cursor-pointer flex flex-row gap-2 items-center;
    }

    .pillPassive:hover
    {
        @apply ring-indigo-500;
    }

</style>