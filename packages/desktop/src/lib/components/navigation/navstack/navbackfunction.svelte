<script lang="ts">
	import { getContext, onDestroy, onMount } from "svelte";
	import type { NavStackContext, NavBackFunction } from "./navstack";

    const navBackFunction = getContext<NavStackContext>("navstack").navBackFunction;

    export let backFunction: NavBackFunction;

    onMount(() => {
        $navBackFunction = backFunction;
    });

    onDestroy(() => {
        $navBackFunction = null;
    });
</script>