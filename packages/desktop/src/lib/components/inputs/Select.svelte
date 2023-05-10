<script lang="ts">
	import { ChevronDown } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { createEventDispatcher } from "svelte";
	import Flex from "../layout/flex.svelte";

    const dispatch = createEventDispatcher<{change: void}>();
    
    export let value: string | number | undefined;
    export let selectableValues: Array<{name: string | number, value: string | number }>;
    export let style = "p-2 rounded-lg ring-inset ring-1 hover:ring-2 ring-gray-500/50 bg-white dark:bg-zinc-800 duration-100";
    export let disabled = false;
    export let change = () => dispatch("change");

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

<div class="relative z-50 {style} {$$props.class}">
    <Flex items="center" gap={2}>
        <button on:click={() => { if(disabled === false) { expand = !expand } }} class="grow text-left">{selectableValues.find(k => k.value == value)?.name ?? "—"}</button>
        <Icon src={ChevronDown} class="h-4 w-4"/>
    </Flex>

    {#if expand === true}
            <div class="absolute top-[calc(100%+0.5rem)] left-0 z-50 max-h-[15vw] overflow-y-scroll" style:min-width={"100%"} use:clickOutside on:click_outside={() => { if(expand) { expand = false; }}}>
                <Flex direction={"col"} gap={2}>
                    {#each selectableValues as sValue}
                         <button 
                            class="rounded-lg py-1.5 px-3 ring-inset ring-1 hover:ring-2 ring-gray-500/50 bg-zinc-200 hover:bg-zinc-100 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-white text-zinc-800 text-left duration-200" 
                            on:click={() => { value = sValue.value; expand = false; change()}}
                        >
                            {sValue.name}
                        </button>
                    {/each}
                </Flex>
            </div>
        {/if}
</div>
