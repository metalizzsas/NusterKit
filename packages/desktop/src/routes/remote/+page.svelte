<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";

    export const ssr = false;

    onMount(() => {
        const remoteIpAccess = window.location.hostname;
        window.localStorage.setItem("ip", remoteIpAccess);

        void goto("/app");
    });

</script>
