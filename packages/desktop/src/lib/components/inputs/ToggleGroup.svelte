<script lang="ts">
	import Toggle from "./Toggle.svelte";

    export let value: string;
    export let group: string[];

    $: internalValue = group.includes(value);

</script>

<Toggle bind:value={internalValue} on:change={(e) => {
    if(group.includes(value))
    {
        group = group.filter(k => k !== value)
    }
    else
    {
        group = [...group, value]
    }
}}/>