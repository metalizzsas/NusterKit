<script lang="ts">
	import SimpleKeyboard from "simple-keyboard";
    import 'simple-keyboard/build/css/index.css';

	import { onMount, onDestroy } from "svelte";
	import Portal from "svelte-portal";
	import { _ } from "svelte-i18n";
	import Flex from "./layout/flex.svelte";
	import TextField from "./inputs/TextField.svelte";
	import NumField from "./inputs/NumField.svelte";
	import Button from "./buttons/Button.svelte";
	import PasswordField from "./inputs/PasswordField.svelte";
	import { browser } from "$app/environment";
	import { realtimeLock } from "$lib/utils/stores/nuster";
	import type { LayoutItem } from "simple-keyboard-layouts/build/interfaces";
	import { page } from "$app/stores";

    let {
        value = $bindable(),
        isPassword = false,
        isPasswordShown = $bindable(false),
        onclose,
    }: {
        value: string | number;
        isPassword?: boolean;
        isPasswordShown?: boolean;
        onclose?: () => void;
    } = $props();

    const close = () => onclose?.();

    let keyboard: SimpleKeyboard | undefined = $state(undefined);
    let layout: "shift" | "shiftOnce" | "default" = $state("default");

    onMount(async () => {

        if (browser)
        {
            const layouts: Record<("en" | "fr" | "it"), LayoutItem> = {
                "fr": (await import("simple-keyboard-layouts/build/layouts/french")).default,
                "en": (await import("simple-keyboard-layouts/build/layouts/english")).default,
                "it": (await import("simple-keyboard-layouts/build/layouts/italian")).default
            };

            keyboard = new SimpleKeyboard(".keyboard", {
                value: value,
                onChange: (input) => {

                    if (typeof value === "number")
                        value = parseFloat(input.replace(",", '.'));
                    else
                        value = input;
                },
                onKeyPress: (button: string) =>
                {
                    if (button === "{shift}")
                    {
                        if (layout === "default")
                        {
                            layout = "shiftOnce";
                            keyboard?.setOptions({ layoutName: "shift" });
                        }
                        else if (layout === "shiftOnce")
                        {
                            layout = "default";
                            keyboard?.setOptions({ layoutName: "default"})
                        }
                    }
                    else if (button === "{lock}")
                    {
                        if (layout === "default" || layout === "shiftOnce")
                            layout = "shift"
                        else
                            layout = "default"

                        keyboard?.setOptions({ layoutName: layout });
                    }
                    else
                    {
                        if (layout === "shiftOnce")
                        {
                            layout = "default"
                            keyboard?.setOptions({ layoutName: layout})
                        }
                    }
                },
                ...layouts[$page.data.settings.lang as ("en" | "fr" | "it") ?? 'en'],
                inputPattern: typeof value === 'number' ? /^[0-9|,|.]*$/ : undefined,
            });

            keyboard.setInput(`${value}`);

            $realtimeLock = true;
        }
    });

    onDestroy(() => {
        $realtimeLock = false;
    })
</script>

<Portal target="body">
    <!-- OS-like bottom sheet -->
    <div
        class="nuster-keyboard fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white/95 p-3 pb-4 shadow-[0_-12px_40px_rgba(0,0,0,0.18)] backdrop-blur animate-in slide-in-from-bottom duration-200 dark:bg-zinc-800/95"
    >
        <div class="mx-auto w-full max-w-4xl">
            <Flex justify="between" class="mb-3" gap={2}>
                {#if typeof value === "string" && isPassword === false}
                    <TextField bind:value={value} disabled keyboardEmbedded class="grow"/>
                {:else if typeof value === "string" && isPassword === true}
                    <PasswordField bind:value={value} bind:secretShown={isPasswordShown} keyboardEmbedded disabled class="grow" />
                {:else if typeof value === "number"}
                    <NumField bind:value={value} disabled keyboardEmbedded class="grow"/>
                {/if}

                <Button onclick={close} color="hover:bg-red-500" ringColor="ring-red-500">
                    {$_('close-keyboard')}
                </Button>
            </Flex>
            <div class="keyboard"/>
        </div>
    </div>
</Portal>

<style>
    /* ── simple-keyboard theme, aligned with the app design system ─────── */

    :global(.nuster-keyboard .hg-theme-default) {
        background: transparent;
        padding: 0;
    }

    :global(.nuster-keyboard .hg-button) {
        height: 46px;
        border-radius: 0.5rem;
        border: 1px solid oklch(0.871 0.006 286.286);
        background: oklch(0.985 0 0);
        color: oklch(0.21 0.006 285.885);
        box-shadow: 0 1px 0 rgb(0 0 0 / 0.04);
        font-size: 0.95rem;
        font-weight: 500;
    }

    /* Function keys (shift, caps, enter, backspace, …) read as secondary */
    :global(.nuster-keyboard .hg-button.hg-functionBtn) {
        background: oklch(0.945 0.002 286.35);
        color: oklch(0.45 0.01 285.9);
        font-size: 0.8rem;
    }

    :global(.nuster-keyboard .hg-button:active),
    :global(.nuster-keyboard .hg-button.hg-activeButton) {
        background: oklch(0.585 0.233 277.117);
        border-color: oklch(0.585 0.233 277.117);
        color: white;
    }

    /* Dark theme */
    :global(.dark .nuster-keyboard .hg-button) {
        border-color: oklch(1 0 0 / 0.09);
        background: oklch(0.32 0.014 280);
        color: oklch(0.985 0 0);
        box-shadow: none;
    }

    :global(.dark .nuster-keyboard .hg-button.hg-functionBtn) {
        background: oklch(0.265 0.012 280);
        color: oklch(0.705 0.015 286.067);
    }

    :global(.dark .nuster-keyboard .hg-button:active),
    :global(.dark .nuster-keyboard .hg-button.hg-activeButton) {
        background: oklch(0.673 0.182 276.935);
        border-color: oklch(0.673 0.182 276.935);
        color: white;
    }
</style>
