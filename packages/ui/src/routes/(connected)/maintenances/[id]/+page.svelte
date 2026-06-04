<script lang="ts">
	import Flex from "$lib/components/layout/flex.svelte";
	import { _, date, time } from "svelte-i18n";
	import SvelteMarkdown from "@humanspeak/svelte-markdown";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { Clock, WrenchScrewdriver } from "@steeze-ui/heroicons";
	import MaintenanceImageParser from "$lib/components/markdown/MaintenanceImageParser.svelte";
	import Button from "$lib/components/buttons/Button.svelte";
	import { enhance } from "$app/forms";
	import type { ActionData, PageData } from "./$types";
	import Wrapper from "$lib/components/Wrapper.svelte";
	import { cn } from "$lib/utils/cn.js";

    let { data, form }: { data: PageData; form: ActionData } = $props();

    let wear_ratio = $derived(Math.min(Math.max(data.maintenance.durationProgress, 0), 1));
    let wear_color = $derived.by(() => {
        const p = data.maintenance.durationProgress;
        if (p >= 1 || p === -1) return "bg-red-500";
        if (p >= 0.75) return "bg-amber-500";
        return "bg-emerald-500";
    });

    $effect(() => {
        if (form?.clearMaintenance && "success" in form.clearMaintenance && form.clearMaintenance.success === true) {
            document.getElementsByTagName("main").item(0)?.scrollTo({ top: 0, behavior: "smooth" });
            form = null;
        }
    });
</script>

<Wrapper>
    <Flex direction="col" gap={2}>
        <h1>{$_('maintenance.tasks.' + data.maintenance.name + '.name')}</h1>
        <p>{$_('maintenance.tasks.' + data.maintenance.name + '.desc')}</p>

        <!-- Wear gauge -->
        <div class="mt-1 flex items-center gap-3">
            <div class="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-zinc-200/80 dark:bg-zinc-700/80">
                <div
                    class={cn("h-full rounded-full transition-all", wear_color)}
                    style="width: {data.maintenance.durationProgress === -1 ? 100 : wear_ratio * 100}%"
                ></div>
            </div>
            <span class="shrink-0 font-mono text-sm tabular-nums text-zinc-600 dark:text-zinc-300">
                {data.maintenance.duration === -1 ? "—" : data.maintenance.duration}/{data.maintenance.durationMax}
                {#if data.maintenance.durationType === "sensor"}
                    {data.maintenance.sensorUnit ?? ""}
                {:else}
                    {$_(`maintenance.unity.${data.maintenance.durationType}`)}
                {/if}
            </span>
        </div>

        {#if data.maintenance.operationDate}
            <p class="text-sm text-zinc-600 dark:text-zinc-300">
                <Icon src={Clock} class="mb-0.5 mr-0.5 inline-block h-4 w-4 text-indigo-500" />
                <span class="font-semibold">{$_('maintenance.last_operation')}:</span>
                {$date(new Date(data.maintenance.operationDate), { format: "medium"})} — {$time(new Date(data.maintenance.operationDate), { format: "medium"})}
            </p>
        {/if}

        <h3 class="leading-10 font-medium"><Icon src={WrenchScrewdriver} class="h-5 w-5 mr-1 inline-block text-indigo-500"/>{$_('maintenance.procedure.lead')}</h3>

        {#if data.maintenanceContent}
            <div class="markdown">
                <SvelteMarkdown source={data.maintenanceContent} renderers={{ image: MaintenanceImageParser }}/>
            </div>
            <form action="?/clearMaintenance" method="post" use:enhance>
                <input type="hidden" name="maintenance_name" value={data.maintenance.name} />
                <Button>{$_('maintenance.procedure.clear')}</Button>
            </form>
        {:else}
            <p class="text-amber-500">{$_('maintenance.procedure.lang_unavailable')}</p>
        {/if}
    </Flex>
</Wrapper>
