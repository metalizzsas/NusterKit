<script lang="ts">

	import { enhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
    import Label from "$lib/components/Label.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
	import PageHeader from "$lib/components/PageHeader.svelte";
	import Button from "$lib/components/buttons/Button.svelte";
	import PasswordField from "$lib/components/inputs/PasswordField.svelte";
	import Flex from "$lib/components/layout/flex.svelte";
	import Grid from "$lib/components/layout/grid.svelte";
	import { realtime } from "$lib/utils/stores/nuster";
	import { ArrowLeft, ArrowPath, ArrowRightCircle, CheckCircle, ExclamationTriangle, XMark } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { onMount } from "svelte";
	import { _ } from "svelte-i18n";

    onMount(() => {
        const interval = setInterval(() => {
            invalidateAll();
        }, 15000);

        return () => clearInterval(interval);
    });

    let password = $state("");

    let processing: string | undefined = $state(undefined);
    let showDetails: string | undefined = $state(undefined);
    let wifiConnectError: string | undefined = $state(undefined);
    let wifiConnectErrorMessage: string | undefined = $state(undefined);

    let wired_device = $derived($realtime.network.devices.find(d => d.iface == "enp1s0u1"));
    let wifi_device = $derived($realtime.network.devices.find(d => d.iface == "wlan0"));

    // Un scan renvoie un point d'accès par radio, pas par réseau : une box en
    // 2,4 et 5 GHz apparaît deux fois sous le même SSID, et les réseaux masqués
    // en renvoient autant au SSID vide. La liste était clée par SSID, donc ces
    // doublons levaient `each_key_duplicate` — une erreur fatale qui supprimait
    // tout le bloc wifi du rendu, sans rien afficher pour l'expliquer.
    //
    // On regroupe donc par SSID en gardant la meilleure réception, ce qui est de
    // toute façon ce que l'opérateur veut voir : la connexion se fait par SSID,
    // deux lignes identiques ne sont pas distinguables à l'usage. Les réseaux
    // masqués sont écartés — on ne sait pas s'y connecter faute de SSID.
    let access_points = $derived(
        [...$realtime.network.accessPoints]
            .filter(ap => ap.ssid !== "")
            .reduce((kept: typeof $realtime.network.accessPoints, ap) => {
                const seen = kept.find(k => k.ssid === ap.ssid);
                if (seen === undefined) kept.push(ap);
                else if (ap.active || (!seen.active && ap.strength > seen.strength)) kept[kept.indexOf(seen)] = ap;
                return kept;
            }, [])
            .sort((a, b) => Number(b.active) - Number(a.active) || b.strength - a.strength)
    );

    $effect(() => {
        if (wifiConnectError) { setTimeout(() => wifiConnectError = undefined, 10000) }
    });
</script>

<PageHeader title={$_('settings.network.edit')} back="/settings" />

<Grid cols={2}>
    {#if wired_device}
        {@const connected = wired_device.address !== undefined}
        <Wrapper variant="muted" padding="p-4" class="self-start">
            <p
                class="-mb-1 flex items-center gap-1.5 text-sm font-medium"
                class:text-amber-600={!connected}
                class:text-emerald-600={connected}
                class:dark:text-amber-400={!connected}
                class:dark:text-emerald-400={connected}
            >
                <span class="h-2 w-2 rounded-full" class:bg-amber-500={!connected} class:bg-emerald-500={connected}></span>
                {$_(`settings.network.connected.${connected}`)}
            </p>
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
        </Wrapper>
    {/if}

    {#if wifi_device}
        {@const connected = wifi_device.address !== undefined}
        <Wrapper variant="muted" padding="p-4" class="self-start">
            <p
                class="-mb-1 flex items-center gap-1.5 text-sm font-medium"
                class:text-amber-600={!connected}
                class:text-emerald-600={connected}
                class:dark:text-amber-400={!connected}
                class:dark:text-emerald-400={connected}
            >
                <span class="h-2 w-2 rounded-full" class:bg-amber-500={!connected} class:bg-emerald-500={connected}></span>
                {$_(`settings.network.connected.${connected}`)}
            </p>
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
                <button
                    onclick={() => invalidateAll()}
                    class="group flex items-center gap-1.5 rounded-lg border border-border bg-white py-1 pl-2.5 pr-2 text-sm font-medium text-zinc-600 transition-colors hover:border-indigo-400 hover:text-indigo-500 dark:bg-zinc-800 dark:text-zinc-300"
                >
                    {$_('settings.network.refresh_available_networks')}
                    <Icon src={ArrowPath} class="h-4 w-4 duration-500 group-hover:rotate-180"/>
                </button>
            </Flex>

            <Grid cols={1} gap={3}>
                {#each access_points as ap (ap.ssid)}
                    {@const barColor = ap.active ? "bg-emerald-500" : "bg-zinc-500 dark:bg-zinc-300"}
                    <div class="flex flex-col gap-4 rounded-xl border border-border bg-white px-3.5 py-2.5 dark:bg-zinc-800/80">

                        <button class="flex w-full items-center justify-between" onclick={() => showDetails = (showDetails === ap.ssid) ? undefined : ap.ssid}>
                            <div class="flex items-center gap-3 text-left">
                                <!-- Signal strength bars -->
                                <div class="flex h-4 items-end gap-0.5" aria-hidden="true" title={`${ap.strength} %`}>
                                    <span class="h-1.5 w-1 rounded-sm {ap.strength >= 15 ? barColor : 'bg-zinc-200 dark:bg-zinc-600'}"></span>
                                    <span class="h-2.5 w-1 rounded-sm {ap.strength >= 45 ? barColor : 'bg-zinc-200 dark:bg-zinc-600'}"></span>
                                    <span class="h-3.5 w-1 rounded-sm {ap.strength >= 75 ? barColor : 'bg-zinc-200 dark:bg-zinc-600'}"></span>
                                </div>
                                <div>
                                    <h5 class="-mb-1">{ap.ssid}</h5>
                                    {#if !ap.active}
                                        <span class="text-xs text-zinc-500 dark:text-zinc-400">{$_('settings.network.network_quality')}: {ap.strength} %</span>
                                    {:else}
                                        <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">{$_('settings.network.connected.true')}</span>
                                    {/if}
                                </div>
                            </div>

                            {#if wifiConnectError === ap.ssid && wifiConnectErrorMessage}
                                <Label>
                                    <span>{$_(wifiConnectErrorMessage)}</span>
                                    <Icon src={XMark} class="h-4 w-4 text-red-500 inline-block" />
                                </Label>
                            {:else}
                                {#if processing !== ap.ssid}
                                    {#if ap.active}
                                        <Icon src={CheckCircle} theme="solid" class="h-6 w-6 text-emerald-500" />
                                    {:else}
                                        <Icon src={ArrowRightCircle} class="h-6 w-6 text-zinc-400" />
                                    {/if}
                                {:else}
                                    <Icon src={ArrowPath} class="h-6 w-6 animate-spin text-amber-500" />
                                {/if}
                            {/if}

                        </button>

                        {#if showDetails === ap.ssid}
                            {#if ap.active}
                                <form action="?/disconectWifi" method="post" use:enhance>
                                    <Button size="small" ringColor="ring-red-500" color="hover:bg-red-500" class="mb-1">{$_('settings.network.disconnect')}</Button>
                                </form>
                            {:else}
                                {@const alreadyConnected = $realtime.network.accessPoints.some(ap => ap.active)}

                                {#if alreadyConnected}
                                    <p class="text-amber-500"><Icon src={ExclamationTriangle} class="h-6 w-6 inline mr-2 mb-0.5" />{$_('settings.network.disconnect_first')}</p>
                                {/if}

                                <form action="?/connectWifi" method="post" use:enhance class="flex justify-between items-center w-full gap-4 mb-1">
                                    <input type="hidden" name="ssid" value={ap.ssid} />
                                    {#if ap.encryption > 0}
                                        <PasswordField placeholder={$_('password')} bind:value={password} disabled={alreadyConnected} class="grow" name="password" />
                                    {/if}
                                    <Button disabled={alreadyConnected || (ap.encryption > 0) ? !(password.length > 7) : false}>{$_('settings.network.connect')}</Button>
                                </form>
                            {/if}
                        {/if}
                    </div>
                {/each}
            </Grid>
        </Wrapper>
    {/if}
</Grid>
