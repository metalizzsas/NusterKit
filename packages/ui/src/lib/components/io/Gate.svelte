<script lang="ts">
    import type { IOGateJSON } from "$lib/types/turbine";
	import Flex from "$lib/components/layout/flex.svelte";
	import Toggle from "$lib/components/inputs/Toggle.svelte";
	import Keyboard from "$lib/components/Keyboard.svelte";
	import { _ } from "svelte-i18n";
	import { page } from "$app/stores";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { ArrowUturnLeft, Minus, Plus } from "@steeze-ui/heroicons";
	import { untrack } from "svelte";

    let {
        io,
        editable = true,
    }: {
        io: IOGateJSON;
        editable?: boolean;
    } = $props();

    let local_value = $state<number | boolean>(untrack(() => io.value));
    let focused = $state(false);

    $effect.pre(() => {
        // Don't overwrite a value being edited via the virtual keyboard
        if (!focused) local_value = io.value;
    });

    let min = $derived(io.type == "mapped" ? io.mapOutMin : 0);
    let max = $derived(io.type == "mapped" ? io.mapOutMax : 100);
    let step = $derived(io.type == "mapped" ? 0.01 : 1);

    const clamp = (v: number) => Math.min(Math.max(Number.isFinite(v) ? v : 0, min ?? 0), max ?? 100);

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

    async function commit_num() {
        const v = clamp(typeof local_value === "boolean" ? (local_value ? 1 : 0) : (local_value ?? 0));
        local_value = v;
        await send_update(v);
    }

    async function step_value(direction: 1 | -1) {
        const current = typeof local_value === "boolean" ? (local_value ? 1 : 0) : (local_value ?? 0);
        // Round to the step precision to avoid float drift (0.01 steps)
        const next = clamp(Math.round((current + step * direction) * 100) / 100);
        local_value = next;
        await send_update(next);
    }

    const stepButtonClass =
        "grid h-11 w-10 shrink-0 place-items-center text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/5 dark:hover:text-zinc-200";
</script>

<Flex items="center" class="w-full">
    <span>
        {$_('gates.names.' + io.name)}
        <span class="text-sm text-zinc-600 dark:text-zinc-400">
            {#if io.locked === true}
                — {$_('locked')}
            {/if}
        </span>
    </span>
    <!-- Filet de liaison : plus léger que les séparateurs de lignes, pour qu'il
         relie le libellé à sa commande sans concurrencer le découpage des lignes. -->
    <div class="h-px grow bg-border/50"></div>

    {#if io.size === "bit"}
        <Toggle bind:value={local_value} change={on_toggle_change} locked={!editable || io.bus == "in" || io.locked} enableGrayScale={io.locked} touchTarget />
    {:else if editable === true}
        <Flex class="items-center" gap={2}>
            <!-- Reset to zero -->
            <button
                type="button"
                onclick={() => { local_value = 0; void send_update(0); }}
                aria-label={$_('gates.reset')}
                title={$_('gates.reset')}
                class="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-border bg-white text-zinc-500 transition-colors hover:border-amber-500 hover:text-amber-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-amber-400"
            >
                <Icon src={ArrowUturnLeft} theme="mini" class="h-4 w-4" />
            </button>

            <!-- Stepper group: − value+unit + -->
            <div class="flex items-stretch overflow-hidden rounded-lg border border-border bg-white shadow-xs dark:bg-zinc-800">
                <button type="button" class={stepButtonClass} aria-label="decrement" onclick={() => step_value(-1)}>
                    <Icon src={Minus} theme="mini" class="h-4 w-4" />
                </button>

                <label class="flex w-24 flex-col items-center justify-center gap-0 px-1 py-1">
                    <input
                        type="number"
                        inputmode="decimal"
                        {min}
                        {max}
                        {step}
                        value={typeof local_value === "boolean" ? (local_value ? 1 : 0) : local_value}
                        onfocus={() => (focused = true)}
                        oninput={(e) => { local_value = e.currentTarget.valueAsNumber; }}
                        onblur={() => { if (!$page.data.is_machine_screen) { focused = false; void commit_num(); } }}
                        class="w-full bg-transparent text-center text-base font-semibold tabular-nums text-foreground outline-none"
                    />
                    {#if io.unity}
                        <span class="text-[10px] font-medium uppercase leading-none tracking-wide text-zinc-400 dark:text-zinc-500">
                            {io.unity}
                        </span>
                    {/if}
                </label>

                <button type="button" class={stepButtonClass} aria-label="increment" onclick={() => step_value(1)}>
                    <Icon src={Plus} theme="mini" class="h-4 w-4" />
                </button>
            </div>
        </Flex>
    {:else}
        <!-- Read-only analog value -->
        <span class="font-mono text-base font-semibold tabular-nums text-foreground">
            {io.value}
            {#if io.unity}
                <span class="text-sm font-medium text-zinc-500 dark:text-zinc-400">{io.unity}</span>
            {/if}
        </span>
    {/if}
</Flex>

{#if focused && $page.data.is_machine_screen && typeof local_value === "number"}
    <Keyboard
        bind:value={local_value}
        onclose={() => {
            focused = false;
            void commit_num();
        }}
    />
{/if}
