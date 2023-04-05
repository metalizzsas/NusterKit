<script lang="ts">

    import Flex from "$lib/components/layout/flex.svelte";

    export let label: string;
    export let value: string | undefined = undefined;

</script>

<Flex items="center">
    <h4 class="font-medium">{label}</h4>

    <div class="h-[1px] bg-zinc-300/50 grow" />

    {#if value}
        {value}
    {:else}
        <slot />
    {/if}
</Flex>