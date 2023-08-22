<script lang="ts">
    export let href: string | undefined = undefined;
    const classNames = "text-sm text-indigo-500 hover:text-indigo-600 duration-200";
</script>

{#if href === undefined}
    <button on:click class={classNames}><slot /></button>
{:else}
    <a {href} class={classNames}><slot /></a>
{/if}
