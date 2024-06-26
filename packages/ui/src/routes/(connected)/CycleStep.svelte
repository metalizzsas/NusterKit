<script lang="ts">
	import Label from "$lib/components/Label.svelte";
	import Flex from "$lib/components/layout/flex.svelte";
	import type { PBRStepHydrated } from "@nuster/turbine/types/hydrated/cycle";
	import { ArrowPath, Check, XMark, type IconSource, ArrowDown } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";

	import { _ } from "svelte-i18n";
	import { page } from "$app/stores";
	import ProgressBarGroup from "$lib/components/ProgressBarGroup.svelte";

    export let step: PBRStepHydrated;
    
    const computeStepIcon = (step: PBRStepHydrated): { icon: IconSource, color: string } => {

        const icon = step.endReason !== "skipped" ? (step.state === "started" ? ArrowPath : ["partial", "ended", "ending"].includes(step.state) ? Check : XMark) : ArrowDown;

        let color = "text-white";

        if(step.endReason === "skipped")
            color = "text-orange-500"
        else
        {
            switch(step.state)
            {
                case "started":
                    color = "text-indigo-500";
                    break;
                case "partial":
                    color = "text-orange-500";
                    break;
                case "crashed":
                    color = "text-red-500";
                    break;
                case "ended":
                case "ending":
                    color = "text-emerald-500";
                    break;
            }
        }

        return {
            icon,
            color
        }
    }

    $: iconData = computeStepIcon(step);

</script>

<div class="p-4 rounded-md border-[1px] border-zinc-400">
    <Flex items="center" justify="between" class={(step.state === "started" || (step.endReason === "skipped" && (step.progress ?? 0) > 0) || (step.state === "crashed" && step.endReason != "ending")) ? "mb-2" : ""}>
        <Flex 
            gap={1} 
            items={step.state === "started" ? "start" : "center"} 
            direction={step.state === "started" ? "col" : "row"}
        >
            <h4 class="leading-6">{$_(`cycle.steps.${step.name}.name`)}</h4>
            
            {#if step.state !== "started"}
                <div class="mx-1 -skew-x-12 h-4 w-0.5 dark:bg-white bg-zinc-800" />
            {/if}

            <p class="text-sm">{$_(`cycle.steps.${step.name}.desc`)}</p>
        </Flex>

        <Flex gap={4}>
            {#if step.runCount !== undefined && step.runAmount !== undefined && step.runAmount > 1 && !$page.data.machine_configuration.settings.hideMultilayerIndications}
                <Label>{step.runCount} / {step.runAmount}</Label>
            {/if}

            {#if step.state === "crashed" && step.endReason !== "ending"}
                <Label>
                    {$_(`cycle.end_reasons.${step.endReason ?? 'error'}`)}
                </Label>
            {/if}

            <Icon src={iconData.icon} class="h-6 w-6 {iconData.icon === ArrowPath ? "animate-spin-slow" : ""} {iconData.color}" />

        </Flex>

    </Flex>

    {#if step.state === "started" || (step.state === "crashed" && step.endReason !== "ending")}
        <ProgressBarGroup showProgressLabelForIndex={step.runCount} progresses={step.progresses} />
    {/if}
</div>