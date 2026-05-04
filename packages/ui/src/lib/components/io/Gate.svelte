<script lang="ts">
    import type { IOGateJSON } from "$lib/types/turbine";
	import Flex from "$lib/components/layout/flex.svelte";
	import Toggle from "$lib/components/inputs/Toggle.svelte";
	import { _ } from "svelte-i18n";
	import Label from "$lib/components/Label.svelte";
	import NumField from "$lib/components/inputs/NumField.svelte";
	import Button from "$lib/components/buttons/Button.svelte";

    let {
        io,
        editable = true,
    }: {
        io: IOGateJSON;
        editable?: boolean;
    } = $props();

    let local_value = $state<number | boolean>(io.value);

    $effect.pre(() => {
        local_value = io.value;
    });

    async function send_update(new_value: number) {
        const formData = new FormData();
        formData.append("gate", io.name);
        formData.append("value", String(new_value));
        try {
            await fetch("?/editGateValue", { method: "POST", body: formData });
        } catch (err) {
            console.error("Gate update failed:", err);
        }
    }

    async function on_toggle_change() {
        // Flip relative to current server-known state to avoid binding timing races
        const new_value = io.value == 0 ? 1 : 0;
        await send_update(new_value);
    }

    async function on_num_change() {
        const v = typeof local_value === "boolean" ? (local_value ? 1 : 0) : (local_value ?? 0);
        await send_update(v);
    }

    async function on_reset() {
        local_value = 0;
        await send_update(0);
    }
</script>

<Flex items="center">
    <span>
        {$_('gates.names.' + io.name)}
        <span class="text-sm text-zinc-600 dark:text-zinc-400">
            {#if io.locked === true}
                — {$_('locked')}
            {/if}
        </span>
    </span>
    <div class="h-[1px] grow bg-zinc-500/50" />

    {#if io.size === "bit"}
        <Toggle bind:value={local_value} change={on_toggle_change} locked={!editable || io.bus == "in" || io.locked} enableGrayScale={io.locked} />
    {:else}
        <Flex class="items-center">
            <Label>
                {io.value}
                {#if io.unity}
                    <span class="font-medium">{io.unity}</span>
                {/if}
            </Label>

            {#if editable === true}
                <Button ringColor={"ring-amber-500"} color={"hover:bg-amber-500"} size={"small"} onclick={on_reset}>{$_('gates.reset')}</Button>
                <NumField
                    bind:value={local_value}
                    change={on_num_change}
                    min={io.type == "mapped" ? io.mapOutMin : 0}
                    max={io.type == "mapped" ? io.mapOutMax : 100}
                    step={io.type == "mapped" ? 0.01 : 1}
                    name="value"
                    validateOnChange
                />
            {/if}
        </Flex>
    {/if}
</Flex>
