<script lang="ts">
	import { page } from "$app/stores";
	import { MinusCircle, PlusCircle } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
	import { createEventDispatcher } from "svelte";
	import Keyboard from "../Keyboard.svelte";
    import Flex from "../layout/flex.svelte";

    const dispatch = createEventDispatcher<{ change: { value: number } }>();

    export let change = () => dispatch("change", { value });
    export let value: number;
    export let disabled = false;

    let focused = false;

    export let min: number | undefined = undefined;
    export let max: number | undefined = undefined;
    export let step: number | undefined = undefined;

    // Min, Max, Step number control to avoid loosing the control over the value
    $: if(min !== undefined && value < min) { 
        value = min 
    } else if(max !== undefined && value > max) { 
        value = max 
    } else if(step !== undefined && value % step !== 0) { 
        value = value - (value % step) 
    }

</script>

<Flex items="center" gap={2} class="ring-gray-500/50 ring-1 ring-inset rounded-md p-2 dark:text-white text-zinc-800 {$$props.class}">

    <input
        type="number"
        class="bg-transparent grow"
        bind:value={value}
        {disabled}
        on:focus={() => focused = true}
        on:input={change}
        {min}
        {max}
    />
    <button on:click={() => { value = (step !== undefined) ? value - step : value - 1; change(); }}><Icon src={MinusCircle} class="h-6 w-6 text-zinc-600 dark:text-white" {disabled}></Icon></button>
    <button on:click={() => { value = (step !== undefined) ? value + step : value + 1; change(); }}><Icon src={PlusCircle} class="h-6 w-6 text-zinc-600 dark:text-white" {disabled}></Icon></button>
</Flex>

{#if focused && $page.data.is_machine_screen}
    <Keyboard bind:value on:close={() => { focused = false; change(); }} />
{/if}

