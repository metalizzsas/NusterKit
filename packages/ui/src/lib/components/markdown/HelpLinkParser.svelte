<script lang="ts">
	import type { Snippet } from "svelte";

    let { href = '', children }: {
        href?: string;
        children?: Snippet;
    } = $props();

    let isInternal = $derived(href.endsWith(".md"));
</script>

{#if !isInternal}
    <span class="dark:text-indigo-300 text-indigo-700 font-medium">{@render children?.()}</span>
{:else}
    <a {href} class="text-indigo-500 font-medium hover:text-indigo-600 duration-100" onclick={() => window.scrollTo({ top: 0 })}>{@render children?.()}</a>
{/if}
