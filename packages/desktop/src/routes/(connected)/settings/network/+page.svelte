<script lang="ts">

	import Label from "$lib/components/Label.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
	import Wrapper2 from "$lib/components/Wrapper2.svelte";
	import Button from "$lib/components/buttons/Button.svelte";
	import PasswordField from "$lib/components/inputs/PasswordField.svelte";
	import Flex from "$lib/components/layout/flex.svelte";
	import Grid from "$lib/components/layout/grid.svelte";
	import { realtime } from "$lib/utils/stores/nuster";
	import type { AccessPoint } from "@metalizzsas/nuster-turbine/types/hydrated/balena";
	import { ArrowLeft, ArrowPath, ArrowRightCircle, CheckCircle, ExclamationTriangle, XMark } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { onMount } from "svelte";
	import { _ } from "svelte-i18n";

    const refreshNetworks = async () => {
        void fetch("/api/network/wifi/list");
        void fetch("/api/network/devices");
    }

    const disconnect = async (ap: AccessPoint) => {
        processing = ap.ssid
        await fetch("/api/network/wifi/disconnect");
        processing = undefined;
        showDetails = undefined;
        refreshNetworks();
    }

    /** Connect the desired AP using the given password */
    const connect = async (ap: AccessPoint) => {
        showDetails = undefined;
        processing = ap.ssid;
        const result = await fetch('/api/network/wifi/connect', { method: 'POST', headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ssid: ap.ssid, password }) });

        if(!result.ok || result.status !== 200)
        {
            wifiConnectError = ap.ssid;
            result.text().then(text => (text === "{}" || text === "") ? "settings.network.errors.wifi_invalid_password" : wifiConnectErrorMessage = text);
        }

        password = "";
        processing = undefined;
        refreshNetworks();
    }

    onMount(() => {
        const interval = setInterval(() => {
            void refreshNetworks();
        }, 15000);

        return () => clearInterval(interval);
    });

    let password = "";

    let processing: string | undefined = undefined;
    let showDetails: string | undefined = undefined;
    let wifiConnectError: string | undefined = undefined;
    let wifiConnectErrorMessage: string | undefined = undefined;

    $: wired_device = $realtime.network.devices.find(d => d.iface == "enp1s0u1");
    $: wifi_device = $realtime.network.devices.find(d => d.iface == "wlan0");

    $: if(wifiConnectError) { setTimeout(() => wifiConnectError = undefined, 10000) }

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
            <h1>{$_('settings.network.interface.wired')}</h1>

            {#if wired_device.address}
                <Flex items="center" justify="between" class="mb-2 mt-2">
                    <span>{$_('settings.network.interface.ip_4')}</span>
                    <Label>{wired_device.address}</Label>
                </Flex>
    
                <Flex items="center" justify="between" class="mb-2">
                    <span>{$_('settings.network.interface.subnet_mask')}</span>
                    <Label>{wired_device.subnet}</Label>
                </Flex>
    
                <Flex items="center" justify="between">
                    <span>{$_('settings.network.interface.gateway_4')}</span>
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
            <h1>{$_('settings.network.interface.wireless')}</h1>

            {#if connected}
                <Flex items="center" justify="between" class="mb-2 mt-2">
                    <span>{$_('settings.network.interface.ip_4')}</span>
                    <Label>{wifi_device.address}</Label>
                </Flex>

                <Flex items="center" justify="between" class="mb-2">
                    <span>{$_('settings.network.interface.subnet_mask')}</span>
                    <Label>{wifi_device.subnet}</Label>
                </Flex>

                <Flex items="center" justify="between" class="mb-6">
                    <span>{$_('settings.network.interface.gateway_4')}</span>
                    <Label>{wifi_device.gateway}</Label>
                </Flex>
            {/if}

            <Flex align="middle" justify="between" class="mb-4 mt-2">
                <h4 class="leading-6">{$_('settings.network.available_networks')}</h4>
                <button on:click={refreshNetworks} class="bg-gray-500 hover:bg-gray-600 group duration-200 py-0.5 pr-1.5 pl-2 rounded-md text-sm text-white">
                    {$_('settings.network.refresh_available_networks')}
                    <Icon src={ArrowPath} class="h-4 w-4 inline ml-2 mb-0.5 group-hover:rotate-180 duration-500"/>
                </button>
            </Flex>

            <Grid cols={1} gap={4}>
                {#each $realtime.network.accessPoints.sort((a, b) => Number(b.active) - Number(a.active)) as ap (ap.ssid)}
                    <div class="flex flex-col gap-4 bg-zinc-200 dark:bg-zinc-800 px-3 py-2 rounded-xl">

                        <button class="flex justify-between items-center w-full" on:click={() => showDetails = (showDetails === ap.ssid) ? undefined : ap.ssid}>
                            <div class="text-left">
                                <h5 class="-mb-1">{ap.ssid}</h5>
                                {#if !ap.active}
                                    <span class="text-xs text-zinc-700 dark:text-zinc-300">{$_('settings.network.network_quality')}: {ap.strength} %</span>
                                {:else}
                                    <span class="text-xs text-zinc-700 dark:text-zinc-300">{$_('settings.network.connected.true')}</span>
                                {/if}
                            </div>

                            {#if wifiConnectError === ap.ssid && wifiConnectErrorMessage}
                                <Label>
                                    <span>{$_(wifiConnectErrorMessage)}</span>
                                    <Icon src={XMark} class="h-4 w-4 text-red-500 inline-block" />
                                </Label>
                            {:else}
                                {#if processing !== ap.ssid}
                                    {#if ap.active}
                                        <Icon src={CheckCircle} class="h-6 w-6 text-indigo-400" />
                                    {:else}
                                        <Icon src={ArrowRightCircle} class="h-6 w-6 text-white-500" />
                                    {/if}
                                {:else}
                                    <Icon src={ArrowPath} class="h-6 w-6 text-amber-500 animate-spin" />
                                {/if}
                            {/if}
    
                        </button>

                        {#if showDetails === ap.ssid}
                        
                            {#if ap.active}
                                <Button size="small" ringColor="ring-red-500" color="hover:bg-red-500" class="mb-1" on:click={() => disconnect(ap)}>{$_('settings.network.disconnect')}</Button>
                            {:else}
                                {@const alreadyConnected = $realtime.network.accessPoints.some(ap => ap.active)}

                                {#if alreadyConnected}
                                    <p class="text-amber-500"><Icon src={ExclamationTriangle} class="h-6 w-6 inline mr-2 mb-0.5" />{$_('settings.network.disconnect_first')}</p>
                                {/if}

                                <div class="flex justify-between items-center w-full gap-4 mb-1">
                                    {#if ap.encryption > 0}
                                        <PasswordField placeholder={$_('password')} bind:value={password} disabled={alreadyConnected} class="grow" />
                                    {/if}
                                    <Button on:click={() => connect(ap)} disabled={alreadyConnected || (ap.encryption > 0) ? !(password.length > 7) : false}>{$_('settings.network.connect')}</Button>
                                </div>
                            {/if}
                        {/if}
                    </div>
                {/each}
            </Grid>
        </Wrapper2>
    {/if}
</Grid>