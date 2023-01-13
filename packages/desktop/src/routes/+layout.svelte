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
	import type { Configuration, WebsocketData } from "@metalizzsas/nuster-typings";
	import Loadindicator from "$lib/components/LoadIndicator.svelte";
	import { dark, lang } from "$lib/utils/stores/settings";
	import { locale } from "svelte-i18n";
	import { page } from "$app/stores";
	import { initi18nLocal } from "$lib/utils/i18n/i18nlocal";
	import Toast from "$lib/components/Toast.svelte";
	import type { Popup } from "@metalizzsas/nuster-typings/build/spec/nuster";
	import { flip } from "svelte/animate";
	import Button from "$lib/components/buttons/Button.svelte";
	import type { MachineData } from "@metalizzsas/nuster-typings/build/hydrated/machine";

    type Toast = Popup & { date: number };

    let toasts: Array<Toast> = [];

    let websocketState: "connecting" | "connected" | "disconnected" = "connecting";
    let websocket: WebSocket | undefined = undefined;

    onMount(async () => {

        initi18nLocal();

        /** Theme store (Boolean) */
		const storedDark = localStorage.getItem('theme') === 'dark';
		$dark = storedDark;

		dark.subscribe((value) => {
			localStorage.setItem('theme', value === true ? 'dark' : 'light');

			if (value === true) document.getElementsByTagName('html')[0].classList.add('dark');
			else document.getElementsByTagName('html')[0].classList.remove('dark');
		});

		/** Lang store */
		const storedLang = localStorage.getItem('lang') ?? 'en';
		$lang = storedLang;

		lang.subscribe((value) => {
			localStorage.setItem('lang', value);
			$locale = value;
		});

        await machineConnect();
    });

    onDestroy(() => {
        websocket?.close();
    });

    const machineConnect = async () =>
    {
        websocketState = "connecting";

        await initI18nMachine();

        const req = await fetch(`/api/machine`);

        if(req.ok && req.status === 200)
            $machine = (await req.json()) as MachineData;

        const isSecure = window.location.protocol === "https:";

        websocket = new WebSocket(`${isSecure ? "wss": "ws"}://${window.location.host}/ws/`);

        websocket.onerror = function() {
            websocketState = "disconnected";
            websocket = undefined;
        }

        setTimeout(() => {
            if(websocketState === "connecting")
            {
                websocketState = "disconnected"
                websocket?.close();
            }
        }, 5000);

        websocket.onclose = function() {
            websocketState = "disconnected";
            websocket = undefined;
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

{#if websocketState === "connecting"}
    <h1 class="m-6">Connecting to machine...</h1>
{:else if websocketState === "connected"}

    {#if $realtime}
        <div class="absolute inset-0 bg-indigo-300 dark:bg-zinc-900 bg-grid dark:bg-grid-dark -z-10"></div>

        <div class="absolute p-6 pl-0 right-0 top-0 bottom-0 h-screen overflow-y-scroll w-[40%] z-20 flex flex-col gap-6 pointer-events-none" id="toasts">
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
        <h1 class="m-6">Connecting to realtime data.</h1>
    {/if}

{:else}
    <div class="m-6">
        <h1>Realtime data has been interupted.</h1>
        <Button color="hover:bg-zinc-800" ringColor="ring-zinc-800" on:click={machineConnect}>Reconnect</Button>
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