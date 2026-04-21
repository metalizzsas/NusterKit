<script lang="ts">
	import type { Snippet } from "svelte";
    import { page } from "$app/stores";

    let {
        href,
        activeUrl,
        exclusiveURL = false,
        children,
    }: {
        href: string;
        activeUrl: string;
        exclusiveURL?: boolean;
        children?: Snippet;
    } = $props();

    let isRoute = $derived(exclusiveURL ? $page.route.id === activeUrl : $page.route.id?.startsWith(activeUrl));
</script>

<a
    {href}
    class:pillActive={isRoute}
    class:pillPassive={!isRoute}
>
    {@render children?.()}
</a>

<style lang="css">
    @reference "tailwindcss";

    .pillActive
    {
        @apply bg-indigo-500/40 py-1 px-3 rounded-full text-white font-medium flex flex-row gap-2 items-center;
    }

    .pillPassive
    {
        @apply py-1 px-3 ring-2 font-medium ring-transparent ring-inset duration-300 rounded-full cursor-pointer flex flex-row gap-2 items-center;
    }

    .pillPassive:hover
    {
        @apply ring-indigo-500/50;
    }
</style>
