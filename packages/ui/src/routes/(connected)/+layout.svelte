<script lang="ts">

    import "$lib/app.css";
    import "@fontsource/inter/400.css";
    import "@fontsource/inter/500.css";
    import "@fontsource/inter/600.css";
    import "@fontsource/inter/700.css";
    import "@fontsource/inter/800.css";
    import "@fontsource/inter/900.css";

	import type { Snippet } from "svelte";
	import { initI18nMachine } from "$lib/utils/i18n/i18nmachine";
	import { onDestroy, onMount } from "svelte";

	import AppSidebar from "./AppSidebar.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";

	import type { WebsocketData, Popup, CallToActionFront } from "$lib/types/turbine";
    import { realtime, realtimeConnected, realtimeLock } from "$lib/utils/stores/nuster";
	import Loadindicator from "$lib/components/LoadIndicator.svelte";
	import { _ } from "svelte-i18n";
	import { Toaster } from "$lib/components/ui/sonner/index.js";
	import { toast } from "svelte-sonner";
	import ToastCta from "$lib/components/ToastCta.svelte";
	import type { PageData } from "./$types";
	import { browser, version } from "$app/environment";
	import { page } from "$app/stores";

    let { data, children }: { data: PageData; children: Snippet } = $props();

    // Sidebar default state: open on index, closed elsewhere.
    // User-toggled state persists within a route, resets on navigation.
    let sidebarOpen = $state($page.url.pathname === "/");
    let lastPath = $state($page.url.pathname);
    $effect(() => {
        const path = $page.url.pathname;
        if (path !== lastPath) {
            sidebarOpen = path === "/";
            lastPath = path;
        }
    });

    let websocketState: "connecting" | "connected" | "disconnected" = $state("connecting");
    let websocket: WebSocket | undefined = $state(undefined);

    onMount(async () => {
        await initI18nMachine();
        await realtimeConnect();
    });

    onDestroy(() => {
        websocket?.close();
    });

    const showPopup = (popup: Popup<CallToActionFront>) => {

        if (popup.payload !== undefined)
        {
            for (const key in popup.payload)
            {
                if (key === "version")
                {
                    popup.payload[key] = version;
                    continue;
                }

                popup.payload[key] = $_(popup.payload[key]);
            }
        }

        // CTA-bearing popups always need acknowledgement → custom render, persistent
        if (popup.callToActions !== undefined && popup.callToActions.length > 0)
        {
            toast.custom(ToastCta, {
                componentProps: { popup },
                duration: Number.POSITIVE_INFINITY,
            });
            return;
        }

        const title = $_(popup.title);
        const description = $_(popup.message, { values: popup.payload });

        if (popup.level === "error")
        {
            toast.error(title, { description, duration: Number.POSITIVE_INFINITY });
        }
        else if (popup.level === "warn")
        {
            toast.warning(title, { description, duration: 10_000 });
        }
        else
        {
            toast.info(title, { description, duration: 5_000 });
        }
    };

    const realtimeConnect = async () =>
    {
        if (!browser) return;

        websocketState = "connecting";

        const isSecure = window.location.protocol === "https:";

        const wsHost = data.websocketAddress
            ? new URL(data.websocketAddress).host
            : new URL(window.origin).host;
        websocket = new WebSocket(`${isSecure ? "wss": "ws"}://${wsHost}/ws/`);

        websocket.onerror = function() {
            websocketState = "disconnected";
            websocket = undefined;
        }

        /** Do not try to connect for more than 5 secondes */
        setTimeout(() => {
            if (websocketState === "connecting")
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

            if (data.type == "status" && $realtimeLock === false)
            {
                if (import.meta.env.DEV)
                {
                    data.message = {...data.message, network: {
                        devices: [
                            { iface: "enp1s0u1", path: "", gateway: "192.168.49.254", subnet: "255.255.255.0"  },
                            { iface: "wlan0", path: "", address: "192.168.49.193", gateway: "192.168.49.254", subnet: "255.255.255.0"  }
                        ],
                        // Calqué sur ce que renvoie une vraie machine : un point
                        // d'accès par radio, donc le même SSID en 2,4 et 5 GHz,
                        // plus les réseaux masqués au SSID vide. Avec deux SSID
                        // distincts, le défaut de clés dupliquées qui supprimait
                        // tout le bloc wifi ne pouvait pas se voir en dev.
                        accessPoints: [
                            { ssid: "Test", active: true, strength: 75, frenquency: 2437, encryption: 2, path: "/AccessPoint/1" },
                            { ssid: "Test2", active: false, strength: 74, frenquency: 2437, encryption: 2, path: "/AccessPoint/2" },
                            { ssid: "Test2", active: false, strength: 55, frenquency: 5180, encryption: 2, path: "/AccessPoint/3" },
                            { ssid: "", active: false, strength: 72, frenquency: 2437, encryption: 1416, path: "/AccessPoint/4" },
                            { ssid: "", active: false, strength: 54, frenquency: 5180, encryption: 1416, path: "/AccessPoint/5" }
                        ]
                    }}
                }
                $realtime = data.message;
            }
            else if (data.type == "patch" && $realtimeLock === false)
            {
                const patch = data.message;
                const merged = { ...$realtime };
                if ('io' in patch) merged.io = patch.io!;
                if ('containers' in patch) merged.containers = patch.containers!;
                if ('cycle' in patch) merged.cycle = patch.cycle === null ? undefined : patch.cycle;
                if ('maintenance' in patch) merged.maintenance = patch.maintenance!;
                if ('network' in patch && !import.meta.env.DEV) merged.network = patch.network!;
                $realtime = merged;
            }
            else if (data.type === "popup")
            {
                showPopup(data.message);
            }
        }
    }

    $effect(() => {
        $realtime = data.machine_status;
    });
    $effect(() => {
        if (websocketState === "disconnected") { toast.dismiss(); }
    });
    $effect(() => {
        if (browser) { document.querySelector("html")?.classList.toggle("dark", data.settings.dark === 1); }
    });
</script>

<Loadindicator />

<Toaster position="top-right" richColors closeButton />

<!-- Ambient background: clean base + a single soft indigo mesh glow. No grid, for a calmer, more refined feel. -->
<div class="fixed inset-0 -z-10 bg-zinc-50 dark:bg-background"></div>
<div class="fixed inset-0 -z-10 hidden dark:block bg-mesh-dark"></div>

<Sidebar.Provider open={sidebarOpen} onOpenChange={(v) => (sidebarOpen = v)}>
    <AppSidebar />
    <Sidebar.Inset class="bg-transparent min-w-0">
        <div class="h-screen min-w-0 overflow-x-hidden overflow-y-auto px-6 py-6">
            {@render children()}
        </div>
    </Sidebar.Inset>
</Sidebar.Provider>
