<script lang="ts">

	import Label from "$lib/components/Label.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
	import Wrapper2 from "$lib/components/Wrapper2.svelte";
	import Button from "$lib/components/buttons/Button.svelte";
	import PasswordField from "$lib/components/inputs/PasswordField.svelte";
	import Flex from "$lib/components/layout/flex.svelte";
	import Grid from "$lib/components/layout/grid.svelte";
	import { realtime } from "$lib/utils/stores/nuster";
	import type { AccessPoint } from "@metalizzsas/nuster-typings/build/hydrated/balena";
	import { ArrowLeft, ArrowPath, ArrowRightCircle, CheckCircle } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { _ } from "svelte-i18n";

    const refreshNetworks = async () => {
        await fetch("/api/network/wifi/list");
    }

    const disconnect = async () => {
        await fetch("/api/network/wifi/disconnect");
    }

    const clickAp = (ap: AccessPoint) => {

        if(ap.active)
        {
            disconnect();
            return;
        }

        if(showPasswordField !== ap.ssid)
        {
            showPasswordField = ap.ssid;
            return;
        }

        void fetch('/api/network/wifi/connect', { method: 'POST', body: JSON.stringify({ ssid: ap.ssid, password }) });
        showPasswordField = "";
    }

    let password = "";
    let showPasswordField = "";

    $: wired_device = $realtime.network.devices.find(d => d.iface == "ensp1");
    $: wifi_device = $realtime.network.devices.find(d => d.iface == "wlan0");

</script>

<Wrapper class="mb-6" padding="p-4">
    <Flex justify="between">
        <h1 class="leading-0">{$_('settings.network.edit')}</h1>

        <a href="/settings">
            <Button size="small" ringColor="ring-amber-500" color="hover:bg-amber-500">
                <Icon src={ArrowLeft} class="inline-block h-5 w-5 mr-1 mb-0.5" />
                {$_('back')}
            </Button>
        </a>
    </Flex>
</Wrapper>

<Grid cols={2}>
    {#if wired_device}
        {@const connected = wired_device.address !== undefined}
        <Wrapper2 class="self-start">
            <p 
                class="-mb-1 text-sm"
                class:text-amber-500={!connected}
                class:text-emerald-500={connected}
            >{$_(`settings.network.connected.${connected}`)}</p>
            <h1>Ethernet</h1>

            {#if wired_device.address}
                <Flex items="center" justify="between" class="mb-2 mt-2">
                    <span>Addresse IPv4</span>
                    <Label>{wired_device.address}</Label>
                </Flex>
    
                <Flex items="center" justify="between" class="mb-2">
                    <span>Masque de sous-réseau</span>
                    <Label>{wired_device.subnet}</Label>
                </Flex>
    
                <Flex items="center" justify="between">
                    <span>Passerelle</span>
                    <Label>{wired_device.gateway}</Label>
                </Flex>
            {/if}
        </Wrapper2>
    {/if}

    {#if wifi_device}
        {@const connected = wifi_device.address !== undefined}
        <Wrapper2 class="self-start">
            <p 
                class="-mb-1 text-sm"
                class:text-amber-500={!connected}
                class:text-emerald-500={connected}
            >{$_(`settings.network.connected.${connected}`)}</p>
            <h1>Wifi</h1>

            {#if connected}
                <Flex items="center" justify="between" class="mb-2 mt-2">
                    <span>Addresse IPv4</span>
                    <Label>{wifi_device.address}</Label>
                </Flex>

                <Flex items="center" justify="between" class="mb-2">
                    <span>Masque de sous-réseau</span>
                    <Label>{wifi_device.subnet}</Label>
                </Flex>

                <Flex items="center" justify="between" class="mb-6">
                    <span>Passerelle</span>
                    <Label>{wifi_device.gateway}</Label>
                </Flex>
            {/if}

            <Flex align="middle" justify="between" class="mb-4 mt-2">
                <h4 class="leading-6">Liste des réseaux disponibles</h4>
                <button on:click={refreshNetworks} class="bg-gray-500 hover:bg-gray-600 group duration-200 py-0.5 pr-1.5 pl-2 rounded-md text-sm text-white">Recharger<Icon src={ArrowPath} class="h-4 w-4 inline ml-2 mb-0.5 group-hover:rotate-180 duration-500"/></button>
            </Flex>

            <Grid cols={1} gap={4}>
                {#each $realtime.network.accessPoints.sort((a, b) => Number(b.active) - Number(a.active)) as ap}
                    <div class="flex flex-col gap-4 bg-zinc-200 dark:bg-zinc-800 px-3 py-2 rounded-xl">

                        <button class="flex justify-between items-center w-full" on:click={() => clickAp(ap)}>
                            <div class="text-left">
                                <h5 class="-mb-1">{ap.ssid}</h5>
                                {#if !ap.active}
                                    <span class="text-xs text-zinc-700 dark:text-zinc-300">Qualité: {ap.strength} %</span>
                                {:else}
                                    <span class="text-xs text-zinc-700 dark:text-zinc-300">Connecté</span>
                                {/if}
                            </div>
    
                            {#if ap.active}
                                <Icon src={CheckCircle} class="h-6 w-6 text-indigo-400" />
                            {:else}
                                <Icon src={ArrowRightCircle} class="h-6 w-6 text-white-500" />
                            {/if}
                        </button>

                        {#if showPasswordField === ap.ssid}
                            <div class="flex justify-between items-center w-full">
                                <PasswordField bind:value={password} />
                                <Button size="small">Connect</Button>
                            </div>
                        {/if}

                        </div>
                {/each}
            </Grid>
        </Wrapper2>
    {/if}
</Grid>