<script lang="ts">
	import { page } from "$app/stores";
	import Keyboard from "../Keyboard.svelte";

    export let value: string;
    export let placeholder: string | undefined = undefined;
    export let disabled = false;

    let focused = false;

</script>

<input
    type="password"
    {placeholder}
    class="ring-gray-500/50 ring-1 rounded-md p-2 bg-transparent dark:text-white text-zinc-800 {$$props.class}"
    bind:value={value}
    on:focus={() => focused = true}
    {disabled}
/>

{#if focused && $page.data.is_machine_screen}
    <Keyboard bind:value isPassword={true} on:close={() => focused = false} />
{/if}