<script lang="ts">
	import { page } from "$app/stores";
	import type { MaintenanceHydrated } from "@metalizzsas/nuster-typings/build/hydrated";
	import { getContext } from "svelte";

    export let href = '';
    export let title: string | undefined = undefined;
    export let text = '';

    const { maintenance } = getContext<{maintenance: MaintenanceHydrated}>("task");

</script>

<img 
    src={`${$page.data.nuster_api_host}/assets/maintenance/${maintenance.name}/${href}`} 
    {title} 
    alt={text} 
    class="my-1 border-[1px] border-indigo-500/50 rounded-md max-w-[66%] aspect-square object-cover mx-auto"
>