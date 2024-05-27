<script lang="ts">
	import { ChevronDown } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { createEventDispatcher } from "svelte";
	import Flex from "../layout/flex.svelte";
	import type { FormInput } from "./formInput";

    const dispatch = createEventDispatcher<{change: void}>();
    
    export let value: string | number | undefined;
    export let selectableValues: Array<{name: string | number, value: string | number }>;
    export let style = "p-2 rounded-lg ring-inset ring-1 hover:ring-2 ring-gray-500/50 bg-white dark:bg-zinc-800 duration-100";
    export let disabled = false;
    export let change = () => dispatch("change");

    export let form: FormInput<"change"> | undefined = undefined;

    let validateButton: HTMLButtonElement | undefined;

    let expand = false;

    /** Dispatch event on click outside of node */
    export function clickOutside(node: HTMLElement) {
    
        const handleClick = (event: MouseEvent) => {
            if (node && !node.contains(event.target) && !event.defaultPrevented)
            {
                node.dispatchEvent(
                    new CustomEvent('click_outside', node)
                )
            }
        }

        document.addEventListener('click', handleClick, true);
    
        return {
            destroy() {
                document.removeEventListener('click', handleClick, true);
            }
        }
    }

</script>

<div class="relative">
    <button class="{style} {$$props.class}" on:click|preventDefault={() => { if(disabled === false) { expand = !expand } }}>
        <Flex items="center" gap={2}>
            <span class="grow text-left">{selectableValues.find(k => k.value == value)?.name ?? "—"}</span>
            <Icon src={ChevronDown} class="h-4 w-4"/>
        </Flex>
    </button>
    
    {#if expand === true}
        <!-- TODO: Reformat to be a single block list for clarity -->
        <div class="absolute top-[calc(100%+0.5rem)] left-0 z-50 max-h-[15vw] overflow-y-scroll" style:min-width={"100%"} use:clickOutside on:click_outside={() => { if(expand) { expand = false; }}}>
            <Flex direction={"col"} gap={2}>
                {#each selectableValues as sValue}
                        <button 
                        class="rounded-lg py-1.5 px-3 ring-inset ring-1 hover:ring-2 ring-gray-500/50 bg-zinc-200 hover:bg-zinc-100 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-white text-zinc-800 text-left duration-200" 
                        on:click|preventDefault={() => { 
                            value = sValue.value;
                            expand = false;
                            change();
                            if(form?.validateOn === "change" && validateButton !== undefined) { setTimeout(() => validateButton?.click(), 10); }
                            console.log(value);
                        }}
                    >
                        {sValue.name}
                    </button>
                {/each}
            </Flex>
        </div>
    {/if}
</div>

{#if form !== undefined}
    <input type="hidden" name={form.name} bind:value form={form.formName} />
    {#if form.validateOn === "change"}
        <button type="submit" form={form.formName} class="hidden" bind:this={validateButton} />
    {/if}
{/if}