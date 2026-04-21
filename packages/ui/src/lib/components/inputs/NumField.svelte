<script lang="ts">
	import { page } from "$app/stores";
	import { MinusCircle, PlusCircle } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
	import Keyboard from "../Keyboard.svelte";
    import Flex from "../layout/flex.svelte";

    let {
        value = $bindable(),
        change = () => {},
        disabled = false,
        keyboardEmbedded = false,
        min = undefined,
        max = undefined,
        step = undefined,
        name = undefined,
        validateOnChange = false,
        class: class_name = '',
    }: {
        value: number;
        change?: () => void;
        disabled?: boolean;
        keyboardEmbedded?: boolean;
        min?: number;
        max?: number;
        step?: number;
        name?: string;
        validateOnChange?: boolean;
        class?: string;
    } = $props();

    let focused = $state(false);

    let validateOnChangeButton: HTMLButtonElement | undefined = $state();

    const increment = () => {

        if (max !== undefined && value >= max)
            value = max;
        else
        {
            if (step !== undefined)
                value = value + step
            else
                value = value + 1;
        }

        change();
        if (validateOnChange && validateOnChangeButton) validateOnChangeButton.click();
    };

    const decrement = () => {

        if (min !== undefined && value <= min)
            value = min;
        else
        {
            if (step !== undefined)
                value = value - step;
            else
                value = value - 1;
        }

        change();
        if (validateOnChange && validateOnChangeButton) validateOnChangeButton.click();
    }
</script>

<Flex items="center" gap={2} class="ring-gray-500/50 ring-1 ring-inset rounded-md p-2 dark:text-white text-zinc-800 {class_name}">

    <input
        type="number"
        class="bg-transparent grow"
        bind:value
        {disabled}
        onfocus={() => focused = true}
        oninput={() => { if (max !== undefined && value > max) { value = max } change(); if (validateOnChange && validateOnChangeButton) validateOnChangeButton.click(); }}
        {min}
        {max}
        {step}
        {name}
    />
    {#if !disabled}
        <button onclick={decrement}><Icon src={MinusCircle} class="h-6 w-6 text-zinc-600 dark:text-white" {disabled}></Icon></button>
        <button onclick={increment}><Icon src={PlusCircle} class="h-6 w-6 text-zinc-600 dark:text-white" {disabled}></Icon></button>
    {/if}
</Flex>

{#if validateOnChange}
    <button type="submit" class="hidden" bind:this={validateOnChangeButton} />
{/if}

{#if !keyboardEmbedded && focused && $page.data.is_machine_screen}
    <Keyboard bind:value onclose={() => { focused = false; change(); }} />
{/if}
