<script lang="ts">
    export let href: string | undefined = undefined;
</script>

<svelte:element this={href === undefined ? "button" : "a"} class="text-sm text-indigo-500 hover:text-indigo-600 duration-200" {href} on:click>
    <slot />
</svelte:element>
