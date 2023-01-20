<script lang="ts">

    import type { Device } from "balena-sdk";
    import type { Status, WebsocketData } from "@metalizzsas/nuster-typings";
    import type { Configuration } from "@metalizzsas/nuster-typings/build/configuration/"
    import { onMount, onDestroy } from "svelte";
    import type { Record } from "pocketbase";
    import { page } from "$app/stores";
    import Link from "$lib/components/Link.svelte";

    export let device: Record & { balenaDevice: Device };

    let machineData: Configuration | undefined;
    let wsData: Status | undefined = undefined;
    let ws: WebSocket | undefined = undefined;
    let isConnected = false;

    let connectPaths: Array<{ ip: string, vpn: boolean, data?: Configuration }> = [];

    onMount(async () => {

        device.balenaDevice.ip_address?.split(" ").filter(k => k !== "192.168.1.2" && k !== "192.168.1.1" && k !== "192.168.42.1").forEach(k => {
            connectPaths.push({
                ip: k,
                vpn: false
            });
        });

        if(device.balenaDevice.is_connected_to_vpn === true)
        {
            connectPaths.push({
                ip: `${device.balenaDevice.uuid}.balena-devices.com`,
                vpn: true
            });
        }

        for(const path of connectPaths)
        {
            const req = await fetch(`/api/machine_connect_test`, { method: 'POST', body: JSON.stringify({ ip: path.ip, secure: path.vpn })});

            if(req.ok && req.status === 200)
            {
                path.data = await req.json() as Configuration;
                break;
            }
        }

        connectPaths = connectPaths.filter(k => k.data !== undefined);

        if(connectPaths.at(0)?.data !== undefined)
        {
            const path = connectPaths[0]
            machineData = path.data;

            let wsAddress = "";

            if(path.vpn)
                wsAddress = `wss://${path.ip}/ws/`;
            else
                wsAddress = `ws://${path.ip}/ws/`;

            ws = new WebSocket(wsAddress);

            ws.onopen = function(e) {

                ws.onmessage = function(e)
                {
                    isConnected = true;
                    const data = JSON.parse(e.data) as WebsocketData;

                    if(data.type === "status")
                        wsData = data.message
                }
            }

            ws.onclose = function() {
                isConnected = false;
            }
            ws.onerror = function() {

                isConnected = false;
            }
        }
    });

    onDestroy(() => {
        ws?.close();
    });

</script>

<tr class="border-b border-indigo-300/50 last:border-b-0">
    <td class="p-4">
        <div>
            <h4 class="leading-4">{device.name}</h4>

            {#if $page.data.user?.expand.organization.role === "admin" && device.expand.sold_by.name !== "Metalizz"}
                <p class="text-sm">Revendeur: {device.expand.sold_by.name}</p>
            {/if}

            {#if $page.data.user?.expand.organization.role === "admin" || $page.data.user?.expand.organisation.role === "reseller"}
                <p class="text-sm">Client final: {device.expand.parent_organization.name ?? ""}</p>
            {/if}

            <p class="text-sm text-zinc-300">Numéro de série: {device.serial}</p>
        </div>
    </td>
    <td class="capitalize">
        {#if machineData}
            {machineData.model} {machineData.variant} {machineData.revision}
        {:else}
            —
        {/if}
    </td>
    <td>
        {#if wsData !== undefined}
            {#if wsData.cycle?.status.mode === "started"}
                <span class="text-indigo-500 font-semibold">Cycle en cours ({Math.floor((wsData.cycle.status.progress ?? 0) * 100)} %)</span>
            {:else if wsData.cycle?.status.mode === "ended"}
                <p class="text-amber-500 font-semibold">Cycle terminé</p>
                <p class="text-sm text-zinc-300">{wsData.cycle.status.endReason}</p>
            {:else}
                <span class="text-emerald-500 font-semibold">Pas de cycle en cours</span>
            {/if}
        {:else}
            —
        {/if}
    </td>
    <td>
        {#if isConnected}
            <Link href="https://{device.balenaDevice.uuid}.balena-devices.com/">Lien nuster ↗</Link>
        {:else}
            —
        {/if}
    </td>
</tr>