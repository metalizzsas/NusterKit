<script lang="ts">
	import type { Snippet } from "svelte";
    import Label from "$lib/components/Label.svelte";
    import Flex from "$lib/components/layout/flex.svelte";

    let {
        label,
        value = undefined,
        children,
    }: {
        label: string;
        value?: string | string[];
        children?: Snippet;
    } = $props();
</script>

<!-- wrap + justify-end: long controls (e.g. German button labels) drop below the
     label, right-aligned, instead of overflowing the card. -->
<Flex items="center" wrap="wrap" justify="end">
    <h4 class="font-medium">{label}</h4>

    <div class="h-px min-w-6 grow bg-border"></div>

    {#if value !== undefined}
        {#if Array.isArray(value)}
            {#each value as v}
                <Label>{v}</Label>
            {/each}
        {:else}
            {value}
        {/if}
    {:else}
        {@render children?.()}
    {/if}
</Flex>
