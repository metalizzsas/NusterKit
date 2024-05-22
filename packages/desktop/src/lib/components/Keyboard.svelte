<script lang="ts">

	import SimpleKeyboard from "simple-keyboard";
    import 'simple-keyboard/build/css/index.css';

	import { onMount, createEventDispatcher, onDestroy } from "svelte";
	import Portal from "svelte-portal";
	import { settings } from "$lib/utils/stores/settings";
	import { _ } from "svelte-i18n";
	import Flex from "./layout/flex.svelte";
	import TextField from "./inputs/TextField.svelte";
	import NumField from "./inputs/NumField.svelte";
	import Button from "./buttons/Button.svelte";
	import { keyboardLeft, keyboardTop } from "$lib/utils/stores/keyboard";
	import PasswordField from "./inputs/PasswordField.svelte";
	import { browser } from "$app/environment";
	import { realtimeLock } from "$lib/utils/stores/nuster";
	import type { LayoutItem } from "simple-keyboard-layouts/build/interfaces";

    const dispatch = createEventDispatcher<{ close: void }>();

    export let value: string | number;
    export let isPassword = false;
    export let isPasswordShown = false;
    export const close = () => dispatch("close");

    let keyboard: SimpleKeyboard | undefined = undefined;
    let keyboardWrapper: HTMLButtonElement;
    let layout: "shift" | "shiftOnce" | "default" = "default";

    let moving = false;

    onMount(async () => {

        if(browser)
        {
            const layouts: Record<("en" | "fr" | "it"), LayoutItem> = {
                "fr": (await import("simple-keyboard-layouts/build/layouts/french")).default,
                "en": (await import("simple-keyboard-layouts/build/layouts/english")).default,
                "it": (await import("simple-keyboard-layouts/build/layouts/italian")).default
            };

            keyboard = new SimpleKeyboard(".keyboard", {
                value: value,
                onChange: (input) => {

                    if(typeof value === "number")
                        value = parseFloat(input.replace(",", '.'));
                    else
                        value = input;
                },
                onKeyPress: (button: string) =>
                {
                    if(button === "{shift}")
                    {
                        if(layout === "default")
                        {
                            layout = "shiftOnce";
                            keyboard?.setOptions({ layoutName: "shift" });
                        }
                        else if(layout === "shiftOnce")
                        {
                            layout = "default";
                            keyboard?.setOptions({ layoutName: "default"})
                        }                    
                    }
                    else if(button === "{lock}")
                    {
                        if(layout === "default" || layout === "shiftOnce")
                            layout = "shift"
                        else
                            layout = "default"
                        
                        keyboard?.setOptions({ layoutName: layout });
                    }
                    else
                    {
                        if(layout === "shiftOnce")
                        {
                            layout = "default"
                            keyboard?.setOptions({ layoutName: layout})
                        }
                    }
                },
                ...layouts[$settings.lang as ("en" | "fr" | "it") ?? 'en'],
                inputPattern: typeof value === 'number' ? /^[0-9|,|.]*$/ : undefined,
            });
    
            keyboard.setInput(`${value}`);
    
            if($keyboardLeft === 0 && $keyboardTop === 0)
            {
                $keyboardLeft = window.innerWidth / 2 - (keyboardWrapper.clientWidth / 2);
                $keyboardTop = window.innerHeight / 2 - (keyboardWrapper.clientHeight / 2);
            }

            $realtimeLock = true;
        }
    });
    
    onDestroy(() => {
        $realtimeLock = false;
    })

    function mouseUp() { moving = false; }

    function mouseDown() { moving = true; }

    // TODO: Use Touch events
    function mouseMove(e: MouseEvent) {
        if(moving)
        {
            $keyboardTop += e.movementY;
            $keyboardLeft += e.movementX;

            if($keyboardTop < 0) $keyboardTop = 0;
            if($keyboardLeft < 0) $keyboardLeft = 0;

            if($keyboardTop > (window.innerHeight - keyboardWrapper.clientHeight)) $keyboardTop = window.innerHeight - keyboardWrapper.clientHeight;
            if($keyboardLeft > (window.innerWidth - keyboardWrapper.clientWidth)) $keyboardLeft = window.innerWidth - keyboardWrapper.clientWidth;
        }
    }

</script>

<Portal target="body">
    <button bind:this={keyboardWrapper} class="p-2 bg-white dark:bg-zinc-800 ring-4 ring-inset cursor-move dark:ring-white rounded-md absolute min-w-[65%]" style:left={`${$keyboardLeft}px`} style:top={`${$keyboardTop}px`} on:mousedown={mouseDown}>
        <Flex justify="between" class="mb-2" gap={2}>
            {#if typeof value === "string" && isPassword === false}
                <TextField bind:value={value} disabled keyboardEmbedded class="grow"/>
            {:else if typeof value === "string" && isPassword === true}
                <PasswordField bind:value={value} bind:secretShown={isPasswordShown} keyboardEmbedded disabled class="grow" />
            {:else if typeof value === "number"}
                <NumField bind:value={value} disabled keyboardEmbedded class="grow"/>
            {/if}

            <Button on:click={close} color="hover:bg-red-500" ringColor="ring-red-500">
                {$_('close-keyboard')}
            </Button>
        </Flex>
        <div class="keyboard"/>
    </button>
</Portal>

<svelte:window on:mouseup={mouseUp} on:mousemove={mouseMove} />