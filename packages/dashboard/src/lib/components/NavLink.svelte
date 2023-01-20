<script lang="ts">
    import { page } from "$app/stores";
    import { Icon } from "@steeze-ui/svelte-icon";
    import type { IconSource } from "@steeze-ui/svelte-icon/types";

    export let href = "#";
    export let content: string;
    export let icon: IconSource;

</script>

<a {href} class="text-lg hover:text-indigo-500 duration-200 group" class:text-indigo-600={$page.url.pathname === href}>
    <Icon src={icon} class="h-5 w-5 inline-block mb-1 mr-2 group-hover:translate-x-1 duration-150" />
    {content}
</a>