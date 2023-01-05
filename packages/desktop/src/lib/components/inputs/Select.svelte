<script lang="ts">
	import { ChevronDown } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";
	import Flex from "../layout/flex.svelte";

    export let value: string | undefined;

</script>

<div class="p-2 rounded-lg ring-inset ring-1 ring-gray-500/50 bg-white dark:bg-zinc-800 {$$props.class}">
    <Flex items="center" gap={2}>
        <select bind:value={value} class="bg-transparent grow" style="appearance: none;">
            <slot />
        </select>
    
        <Icon src={ChevronDown} class="h-4 w-4"/>
    </Flex>
</div>
