<script lang="ts">
	import { ChevronDown } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { createEventDispatcher } from "svelte";
	import Flex from "../layout/flex.svelte";

    const dispatch = createEventDispatcher<{change: void}>();
    
    export let value: string | number | undefined;
    export let selectableValues: Array<{name: string | number, value: string | number}>;
    export let style = "p-2 rounded-lg ring-inset ring-1 ring-gray-500/50 bg-white dark:bg-zinc-800";
    export let disabled = false;
    export let change = () => dispatch("change");

    let expand = false;
</script>

<div class="relative {style} {$$props.class}">
    <Flex items="center" gap={2}>
        <button on:click={() => { if(disabled === false) { expand = !expand } }} class="grow">{selectableValues.find(k => k.value == value)?.name}</button>

        {#if expand === true}
            <div class="absolute z-50 max-h-[15vw] overflow-y-scroll" style:width={"200%"} style:right={"calc(100% + 1rem)"}>
                <Flex direction={"col"} gap={1}>
                    {#each selectableValues as sValue}
                         <button 
                            class="rounded-lg p-1.5 ring-inset ring-1 ring-gray-500/50 dark:bg-white dark:text-zinc-800 bg-zinc-800 text-white text-start" 
                            on:click={() => { value = sValue.value; expand = false; change()}}
                        >
                            {sValue.name}
                        </button>
                    {/each}
                </Flex>
            </div>
        {/if}
        <Icon src={ChevronDown} class="h-4 w-4"/>
    </Flex>
</div>
