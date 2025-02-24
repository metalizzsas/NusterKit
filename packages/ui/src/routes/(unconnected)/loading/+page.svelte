<script lang="ts">
	import { onMount } from "svelte";
	import type { PageData } from "./$types";
	import { invalidateAll } from "$app/navigation";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { ArrowPath } from "@steeze-ui/heroicons";
	import { _ } from "svelte-i18n";

    let refreshTimer: NodeJS.Timeout | undefined = undefined;

    onMount(() => {

        refreshTimer = setInterval(() => {
            invalidateAll();
        }, 1000);

        return () => {
            if(refreshTimer)
                clearInterval(refreshTimer);
        }
    });

</script>

<div class="h-screen w-screen flex flex-col items-center justify-center">
    <div>
        <div class="flex items-start gap-4 mb-2">
            <Icon src={ArrowPath} class="w-12 h-12 animate-spin" />
            <div>
                <h1>{$_("error.loading.lead")}</h1> 
                <p>{$_('error.loading.sub')}</p>
            </div>
        </div>
    </div>
</div>

