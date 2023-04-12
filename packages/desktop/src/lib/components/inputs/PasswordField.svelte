<script lang="ts">
	import { page } from "$app/stores";
	import { Icon } from "@steeze-ui/svelte-icon";
	import Keyboard from "../Keyboard.svelte";
	import { Eye, EyeSlash } from "@steeze-ui/heroicons";

    export let value: string;
    export let placeholder: string | undefined = undefined;
    export let disabled = false;
    export let secretShown = false;

    export let keyboardEmbedded = false;

    let passwordElement: HTMLInputElement | undefined;

    let focused = false;

    $: if(passwordElement) { passwordElement.type = secretShown ? "text" : "password"; }

</script>

<div class="ring-gray-500/50 ring-1 rounded-md p-2 bg-transparent dark:text-white text-zinc-800 flex flex-row items-center {$$props.class}">
    <input
        bind:this={passwordElement}
        type="password"
        {placeholder}
        class="bg-transparent dark:text-white text-zinc-800 grow"
        bind:value={value}
        on:focus={() => focused = true}
        {disabled}
    />
    <button on:click={() => { secretShown = !secretShown; if(focused) { passwordElement?.focus(); } if(passwordElement) { console.log(passwordElement.selectionStart); passwordElement.selectionStart = value.length }}}>
        <Icon src={secretShown ? Eye : EyeSlash} class="h-4 w-4 mr-1.5" />
    </button>
</div>

{#if !keyboardEmbedded && focused && $page.data.is_machine_screen}
    <Keyboard bind:value isPassword={true} bind:isPasswordShown={secretShown} on:close={() => focused = false} />
{/if}