<script lang="ts">
	import { getContext, onDestroy, onMount } from "svelte";
	import type { NavStackContext, NavActionButton } from "./navstack";

    const navActions = getContext<NavStackContext>("navstack").navActions;

    export let action: NavActionButton;

    onMount(() => {
        $navActions = [...$navActions, action];
    });

    onDestroy(() => {
        $navActions = $navActions.filter(na => na !== action);
    })

</script>