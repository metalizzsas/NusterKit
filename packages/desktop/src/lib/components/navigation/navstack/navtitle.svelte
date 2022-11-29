<script lang="ts">
	import { getContext } from "svelte";
    import type { NavStackContext } from "./navstack";

    export let title: string[];

    const context = getContext<NavStackContext>("navstack");
    const navTitle = context.navTitle;

    $: $navTitle = title
</script>