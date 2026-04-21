<script lang="ts">
	import Toggle from "./Toggle.svelte";

    let {
        value,
        group = $bindable(),
    }: {
        value: string;
        group: string[];
    } = $props();

    let internalValue = $derived(group.includes(value));
</script>

<Toggle bind:value={internalValue} change={() => {
    if (group.includes(value))
    {
        group = group.filter(k => k !== value)
    }
    else
    {
        group = [...group, value]
    }
}}/>
