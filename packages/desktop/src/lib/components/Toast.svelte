<script lang="ts">

	import type { Popup } from "@metalizzsas/nuster-typings/build/spec/nuster";
	import { ExclamationCircle, ExclamationTriangle, InformationCircle, XMark } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { createEventDispatcher } from "svelte";
	import { _ } from "svelte-i18n";
	import Flex from "./layout/flex.svelte";
    import { fly } from "svelte/transition";
	import Button from "./buttons/Button.svelte";
	import { executeCallToAction } from "$lib/utils/callToAction";

    const dispatch = createEventDispatcher<{ exit: void }>();

    export let exit = () => dispatch("exit");
    export let toast: Popup;

    const icons = {
        "info": {
            icon: InformationCircle,
            color: "text-indigo-500"
        },
        "warn": {
            icon: ExclamationTriangle,
            color: "text-orange-500"
        },
        "error": { 
            icon: ExclamationCircle,
            color: "text-red-500"
        }
    };

</script>

<div
    class="p-4 rounded-xl ring-2 ring-inset ring-indigo-500 dark:bg-white dark:text-zinc-800 bg-zinc-900 text-white shadow-2xl pointer-events-auto"
    transition:fly|local={{x: 100, duration: 300}}
>
    <Flex gap={2} items="center">
        <Icon src={icons[toast.level].icon} theme="solid" class="h-6 w-6 shrink-0 {icons[toast.level].color}"/>
        <h2 class="truncate">{$_(toast.title)}</h2>
        <button on:click={exit} class="ml-auto">
            <Icon src={XMark} class="h-6 w-6" />
        </button>
    </Flex>

    <p class="leading-6 {toast.callToActions ? "my-3" : "mt-3"} break-words">{$_(toast.message, { values: toast.payload })}</p>

    {#if toast.callToActions}
        <Flex items="center" justify="center">
            {#each toast.callToActions as cta}
                <Button on:click={() => { executeCallToAction(cta).then(() => { exit(); })}} textColor="dark:text-zinc-800 text-white">{$_(cta.name)}</Button>
            {/each}
        </Flex>
    {/if}
</div>