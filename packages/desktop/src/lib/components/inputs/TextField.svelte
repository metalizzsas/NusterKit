<script lang="ts">
	import { page } from "$app/stores";
	import Keyboard from "../Keyboard.svelte";

    export let value: string;
    export let placeholder: string | undefined = undefined;
    export let disabled: boolean = false;

    let focused = false;

</script>

<input
    type="text"
    {placeholder}
    class="ring-gray-500/50 ring-1 ring-inset rounded-md p-2 bg-transparent dark:text-white text-zinc-800 {$$props.class}"
    bind:value={value}
    {disabled}
    on:focus={() => {
        if(disabled === false)
            focused = true;
    }}
/>

{#if focused && $page.data.is_machine_screen}
    <Keyboard bind:value on:close={() => focused = false} />
{/if}