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

    import { machine, realtime, realtimeLock } from "$lib/utils/stores/nuster";
	import type { WebsocketData } from "@metalizzsas/nuster-typings";
	import Loadindicator from "$lib/components/LoadIndicator.svelte";
	import { settings } from "$lib/utils/stores/settings";
	import { locale } from "svelte-i18n";
	import { initi18nLocal } from "$lib/utils/i18n/i18nlocal";
	import Toast from "$lib/components/Toast.svelte";
	import type { Popup } from "@metalizzsas/nuster-typings/build/spec/nuster";
	import { flip } from "svelte/animate";
	import Button from "$lib/components/buttons/Button.svelte";
	import type { MachineData } from "@metalizzsas/nuster-typings/build/hydrated/machine";
	import { fade } from "svelte/transition";
	import type { Unsubscriber } from "svelte/store";

    type Toast_popup = Popup & { date: number };

    let toasts: Array<Toast_popup> = [];

    let websocketState: "connecting" | "connected" | "disconnected" = "connecting";
    let websocket: WebSocket | undefined = undefined;
    let settingsSubscribe: Unsubscriber | undefined = undefined;

    onMount(async () => {

        initi18nLocal();

        settings.subscribe((value) => {
            $locale = value.lang;

            if(value.dark === 1)
                document.getElementsByTagName('html')[0].classList.add("dark");
            else
                document.getElementsByTagName('html')[0].classList.remove("dark");
        });

        await machineConnect();
    });

    onDestroy(() => {
        websocket?.close();
    });

    const machineConnect = async () =>
    {
        websocketState = "connecting";

        const req = await fetch(`/api/machine`);
        
        if(req.ok && req.status === 200)
            $machine = (await req.json()) as MachineData;
        
        await initI18nMachine($machine);

        const reqSettings = await fetch('/api/settings');
        if(reqSettings.ok && reqSettings.status === 200)
        {
            const s = await reqSettings.json() as { dark: boolean, lang: string };
            $settings = s;

            settingsSubscribe = settings.subscribe(value => {

                if(Object.keys(value).length !== 2)
                    return;

                void fetch("/api/settings", { method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify(value) });
            });
        }

        const isSecure = window.location.protocol === "https:";

        websocket = new WebSocket(`${isSecure ? "wss": "ws"}://${window.location.host}/ws/`);

        websocket.onerror = function() {
            websocketState = "disconnected";
            websocket = undefined;
            settingsSubscribe?.();
        }

        setTimeout(() => {
            if(websocketState === "connecting")
            {
                websocketState = "disconnected"
                websocket?.close();
                settingsSubscribe?.();
            }
        }, 5000);

        websocket.onclose = function() {
            websocketState = "disconnected";
            websocket = undefined;
            settingsSubscribe?.();
        }

        websocket.onopen = function() {
            websocketState = "connected";
        }

        websocket.onmessage = function(ev) {

            const data = JSON.parse(ev.data as string) as WebsocketData;

            if(data.type == "status" && $realtimeLock === false)
                $realtime = data.message;
            else if(data.type === "popup")
                toasts = [{...data.message, date: Date.now() }, ...toasts];
        }
    }
    $: if(websocketState === "disconnected") { toasts = []; }

</script>

<Loadindicator />

{#if websocketState === "connected" && $realtime !== undefined}

    <div class="absolute inset-0 bg-indigo-300 dark:bg-zinc-900 bg-grid dark:bg-grid-dark -z-10"></div>

    <div class="absolute p-6 pl-0 right-0 top-0 bottom-0 h-screen overflow-y-scroll w-1/2 z-20 flex flex-col gap-6 pointer-events-none" id="toasts">
        {#each toasts as toast (toast.date)}
            <div animate:flip={{duration: 300}}>
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
{:else}
    <div class="bg-zinc-900 absolute z-50 inset-0" out:fade={{duration: 250, delay: 600}}>
        <Flex direction="col" items="center" justify="center" class="h-screen">
            <Flex gap={24} items="center">
                <img src="/icons/icon-512.png" class="h-2/3 aspect-square rounded-xl" alt="Nuster logo" />
                <div class="text-white grow">
                    <h1 class="text-4xl mb-12">
                        {#if websocketState === "connecting"}
                            Connecting to machine...
                        {:else if websocketState === "connected" && $realtime !== undefined}
                            Connecting to realtime data.
                        {:else if websocketState === "disconnected"}
                            Realtime data has been interupted.
                        {:else}
                            Connected.
                        {/if}
                    </h1>
                    <Button color="hover:bg-zinc-800" ringColor="ring-zinc-800" textColor="text-white" textHoverColor="hover:text-white" on:click={() => window.location.reload()}>Reconnect</Button>
                </div>
            </Flex>               
        </Flex>
    </div>
{/if}

<style>

    :global(body) {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        letter-spacing: 0.3px;
    }

    .bg-grid
    {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(15 23 42 / 0.04)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
    }

</style>