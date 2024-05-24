<script lang="ts">

    import "$lib/app.css";
    import "@fontsource/inter/400.css";
    import "@fontsource/inter/500.css";
    import "@fontsource/inter/600.css";
    import "@fontsource/inter/700.css";
    import "@fontsource/inter/800.css";
    import "@fontsource/inter/900.css";

	import Flex from "$lib/components/layout/flex.svelte";
	import { initI18nMachine } from "$lib/utils/i18n/i18nmachine";
	import { onDestroy, onMount } from "svelte";

	import PillMenu from "./PillMenu.svelte";

	import type { WebsocketData } from "@metalizzsas/nuster-turbine/types";
	import type { Popup } from "@metalizzsas/nuster-turbine/types/spec/nuster";
    import { realtime, realtimeConnected, realtimeLock } from "$lib/utils/stores/nuster";
	import Loadindicator from "$lib/components/LoadIndicator.svelte";
	import { _, locale } from "svelte-i18n";
	import { initi18nLocal } from "$lib/utils/i18n/i18nlocal";
	import Toast from "$lib/components/Toast.svelte";
	import { flip } from "svelte/animate";
	import { version } from "$lib/version";
	import { env } from "$env/dynamic/public";
	import type { PageData } from "./$types";
	import { browser } from "$app/environment";

    export let data: PageData;

    type Toast_popup = Popup & { date: number };

    let toasts: Array<Toast_popup> = [];

    let websocketState: "connecting" | "connected" | "disconnected" = "connecting";
    let websocket: WebSocket | undefined = undefined;

    $realtime = data.machine_status;
    $locale = data.settings.lang;

    onMount(async () => {
        initi18nLocal();
        await realtimeConnect();
    });

    onDestroy(() => {
        websocket?.close();
    });

    const realtimeConnect = async () =>
    {
        websocketState = "connecting";
        
        await initI18nMachine();

        const isSecure = window.location.protocol === "https:";

        websocket = new WebSocket(`${isSecure ? "wss": "ws"}://${env.PUBLIC_TURBINE_ADDRESS}/ws/`);

        websocket.onerror = function() {
            websocketState = "disconnected";
            websocket = undefined;
        }

        /** Do not try to connect for more than 5 secondes */
        setTimeout(() => {
            if(websocketState === "connecting")
            {
                websocketState = "disconnected"
                websocket?.close();
            }
        }, 5000);

        websocket.onclose = function() {
            websocketState = "disconnected";
            $realtimeConnected = false;
            websocket = undefined;
        }

        websocket.onopen = function() {
            websocketState = "connected";
            $realtimeConnected = true;
        }

        websocket.onmessage = function(ev) {

            const data = JSON.parse(ev.data as string) as WebsocketData;

            if(data.type == "status" && $realtimeLock === false)
            {
                if(import.meta.env.DEV)
                {
                    data.message = {...data.message, network: {
                        devices: [
                            { iface: "enp1s0u1", path: "", gateway: "192.168.49.254", subnet: "255.255.255.0"  },
                            { iface: "wlan0", path: "", address: "192.168.49.193", gateway: "192.168.49.254", subnet: "255.255.255.0"  }
                        ],
                        accessPoints: [
                            { ssid: "Test", active: true, strength: 75, frenquency: 2500, encryption: 2, path: "" },
                            { ssid: "Test2", active: false, strength: 75, frenquency: 2500, encryption: 2, path: "" }
                        ]
                    }}
                }
                $realtime = data.message;
            }
            else if(data.type === "popup")
            {
                if(data.message.payload !== undefined)
                {
                    for(const key in data.message.payload)
                    {
                        if(key === "version")
                        {
                            data.message.payload[key] = version;
                            continue;
                        }
                        
                        data.message.payload[key] = $_(data.message.payload[key]);
                    }
                }
                
                toasts = [{...data.message, date: Date.now() }, ...toasts];
            }
        }
    }

    $: if(websocketState === "disconnected") { toasts = []; }
    $: if(browser) { document.querySelector("html")?.classList.toggle("dark", data.settings.dark === 1); }

</script>

<Loadindicator />

<div class="absolute inset-0 bg-indigo-300 dark:bg-zinc-900 bg-grid dark:bg-grid-dark -z-10"></div>

<div class="absolute p-6 pl-0 right-0 top-0 bottom-0 h-screen overflow-y-scroll w-1/2 z-20 flex flex-col gap-6 pointer-events-none" id="toasts">
    {#each toasts as toast (toast.date)}
        <div animate:flip={{ duration: 300 }}>
            <Toast bind:toast on:exit={() => { toasts = toasts.filter(t => t !== toast)}} />
        </div>
    {/each}
</div>

<div class="h-screen">
    <Flex direction="col" gap={6} class="h-full">
        <header class="mt-6 mx-6">        
            <nav class="bg-white dark:bg-zinc-800 p-2 rounded-full w-full drop-shadow-xl border border-indigo-400/50 dark:border-indigo-400/25">
                <PillMenu />
            </nav>
        </header>
        <main class="pb-6 mx-6 rounded-t-xl grow overflow-y-scroll">
            <slot />
        </main>
    </Flex>
</div>