<script lang="ts">

    import { page } from "$app/stores";

    /** page sent to */
    export let href: string;
    /** Active URL */
    export let activeUrl: string;

    /** Do the active URL should be equal to the current page route, default behavior is page route starts with activeURL */
    export let exclusiveURL = false;

    $: isRoute = exclusiveURL ? $page.route.id === activeUrl : $page.route.id?.startsWith(activeUrl);

</script>

<a 
    {href} 
    class:pillActive={isRoute} 
    class:pillPassive={!isRoute}
>
    <slot />
</a>

<style lang="css">

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