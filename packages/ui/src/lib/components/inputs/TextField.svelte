<script lang="ts">
	import { page } from "$app/stores";
	import Keyboard from "../Keyboard.svelte";

    let {
        value = $bindable(),
        placeholder = undefined,
        disabled = false,
        keyboardEmbedded = false,
        class: class_name = '',
    }: {
        value: string;
        placeholder?: string;
        disabled?: boolean;
        keyboardEmbedded?: boolean;
        class?: string;
    } = $props();

    let focused = $state(false);
</script>

<input
    type="text"
    {placeholder}
    class="ring-gray-500/50 ring-1 ring-inset rounded-md p-2 bg-transparent dark:text-white text-zinc-800 {class_name}"
    bind:value
    {disabled}
    onfocus={() => {
        if (disabled === false)
            focused = true;
    }}
/>

{#if !keyboardEmbedded && focused && $page.data.is_machine_screen}
    <Keyboard bind:value onclose={() => focused = false} />
{/if}
