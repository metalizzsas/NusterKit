<script lang="ts">

    export let href = '';    

    $: isInternal = href.endsWith(".md");

</script>

{#if !isInternal}
    <span class="dark:text-indigo-300 text-indigo-700 font-medium"><slot /></span>
{:else}
    <a href={href} class="text-indigo-500 font-medium hover:text-indigo-600 duration-100"><slot /></a>
{/if}