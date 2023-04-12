<script lang="ts">

    import Label from "$lib/components/label.svelte";
import Flex from "$lib/components/layout/flex.svelte";

    export let label: string;
    export let value: string | string[] | undefined = undefined;

</script>

<Flex items="center">
    <h4 class="font-medium">{label}</h4>

    <div class="h-[1px] bg-zinc-300/50 grow" />

    {#if value !== undefined}
        {#if Array.isArray(value)}
            {#each value as v}
                <Label>{v}</Label>
            {/each}
        {:else}
            {value}
        {/if}
    {:else}
        <slot />
    {/if}
</Flex>