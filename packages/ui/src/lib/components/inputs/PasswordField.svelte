<script lang="ts">
	import { page } from "$app/stores";
	import { Icon } from "@steeze-ui/svelte-icon";
	import Keyboard from "../Keyboard.svelte";
	import { Eye, EyeSlash } from "@steeze-ui/heroicons";

    let {
        value = $bindable(),
        disabled = false,
        secretShown = $bindable(false),
        placeholder = undefined,
        name = undefined,
        keyboardEmbedded = false,
        class: class_name = '',
    }: {
        value: string;
        disabled?: boolean;
        secretShown?: boolean;
        placeholder?: string;
        name?: string;
        keyboardEmbedded?: boolean;
        class?: string;
    } = $props();

    let passwordElement: HTMLInputElement | undefined = $state();

    let focused = $state(false);

    $effect(() => {
        if (passwordElement) { passwordElement.type = secretShown ? "text" : "password"; }
    });
    $effect(() => {
        if (secretShown) { setTimeout(() => secretShown = false, 3000); }
    });
</script>

<div class="ring-gray-500/50 ring-1 rounded-md p-2 bg-transparent dark:text-white text-zinc-800 flex flex-row items-center {class_name}">
    <input
        bind:this={passwordElement}
        {name}
        type="password"
        {placeholder}
        class="bg-transparent dark:text-white text-zinc-800 grow"
        bind:value
        onfocus={() => focused = true}
        {disabled}
        autocomplete="off"
    />
    <button onclick={(e) => { e.preventDefault(); secretShown = !secretShown; if (focused) { passwordElement?.focus(); } if (passwordElement) { passwordElement.selectionStart = value.length }}}>
        <Icon src={secretShown ? Eye : EyeSlash} class="h-4 w-4 mr-1.5" />
    </button>
</div>

{#if !keyboardEmbedded && focused && $page.data.is_machine_screen}
    <Keyboard bind:value isPassword={true} bind:isPasswordShown={secretShown} onclose={() => focused = false} />
{/if}
