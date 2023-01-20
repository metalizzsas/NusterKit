<script lang="ts">
    
    import Button from "$lib/components/buttons/Button.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import { parseDurationToString } from "$lib/utils/dateparser";
    import { ArrowPath, ArrowRight, Check, CheckCircle, Clock, ExclamationCircle, InformationCircle, Square3Stack3d, XMark } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
	import { _ } from "svelte-i18n";
	import { translateProfileName } from "$lib/utils/i18n/i18nprofile";
	import { machine, realtime } from "$lib/utils/stores/nuster";
	import { createEventDispatcher } from "svelte";
	import Gate from "./io/Gate.svelte";
	import Label from "$lib/components/label.svelte";

    const dispatch = createEventDispatcher<{ patched: void }>();

    export let patched = () => { dispatch("patched"); }
    
    const startCycle = async () => {

        if(cycleData === undefined)
            return;
        
        if(cycleData.startConditions.filter(sc => ["error", "warning"].includes(sc.result)).length > 0)
            return;

        await fetch(`/api/v1/cycle`, { method: "POST" });
    }

    const stopCycle = async () => {
        await fetch(`/api/v1/cycle`, { method: "DELETE" });
    }

    const nextStepCycle = async () => {
        await fetch(`/api/v1/cycle`, { method: "PUT"})
    }

    const patchCycle = async () => {
        await fetch(`/api/v1/cycle`, { method: "PATCH" }).then(() => patched());
    }

    /// — Reactive statements
    $: cycleData = $realtime.cycle;

</script>

{#if cycleData !== undefined && cycleData.status.mode === "created"}

    {@const ready = cycleData.startConditions.filter(k => ["warning", "error"].includes(k.result)).length == 0}

    {#if cycleData.profile}
        <p class="text-sm text-zinc-600 dark:text-zinc-300 -mb-1">{$_(`cycle.names.${cycleData.name}`)}</p>
        <h1>{translateProfileName($_, cycleData.profile)}</h1>
    {:else}
        <h1>{$_(`cycle.names.${cycleData.name}`)}</h1>
    {/if}

    {#if cycleData !== undefined && cycleData.status.estimatedRunTime !== undefined}
        <p class="mt-3 mb-4">
            <Icon src={Clock} class="h-5 w-5 mr-0.5 mb-0.5 inline-block" />
            <span class="font-semibold">{$_('cycle.eta.estimated')}</span>
            {#if cycleData.status.estimatedRunTime === null}
                <span>{$_('cycle.eta.null')}</span>
            {:else}
                <span>{parseDurationToString(cycleData.status.estimatedRunTime)}</span>
            {/if}
        </p>
    {/if}

    <Button 
        class="group self-start mb-2" 
        color={ready ? "hover:bg-emerald-500" : "hover:bg-red-500"}
        ringColor={ready ? "ring-emerald-500" : "ring-red-500"}
        on:click={startCycle}
    >
        <Flex>
            {#if ready}
                <Icon src={ArrowRight} class="h-6 w-6 group-hover:translate-x-1 duration-300" theme="mini"/>
            {/if}
            {$_('cycle.buttons.start')}
        </Flex>
    </Button>

    <div class="h-0.5 bg-zinc-300/50 rounded-full mx-auto w-2/3 my-2" />

    <Flex items="center">

        <h3 class="leading-10 font-semibold text-md">{$_('cycle.categories.security_conditions')}</h3>
        <div class="h-[1px] bg-zinc-600/50 grow" />
        <div 
            class:text-red-500={cycleData.startConditions.filter(k => k.result == "error").length > 0}
            class:text-amber-500={cycleData.startConditions.filter(k => k.result == "warning").length > 0}
            class:text-emerald-500={cycleData.startConditions.filter(k => k.result == "good").length > 0}
        >
            <Icon src={ready ? CheckCircle : ExclamationCircle} theme="solid" class="h-7 w-7 -ml-1.5 translate-x-1.5 grow {ready ? "text-emerald-500" : "text-red-500"}" />
        </div>

    </Flex>

    <Flex direction="col" gap={0.5}>
        {#each cycleData.startConditions.filter(sc => sc.result != "disabled") as sc}
            <Flex direction="row" items="center">
                <span>{$_(`cycle.start_conditions.${sc.conditionName}`)}</span>
                <div class="h-[1px] bg-zinc-600/50 grow" />
                <div 
                    class="rounded-full h-2.5 w-2.5"
                    class:bg-red-500={sc.result == "error"}
                    class:bg-amber-500={sc.result == "warning"}
                    class:bg-emerald-500={sc.result == "good"}
                />
            </Flex>
        {/each}
    </Flex>

{:else if cycleData !== undefined && cycleData.status.mode === "started"}
    <Flex>
        <Flex direction="col" gap={1}>
            <p class="text-sm text-zinc-600 dark:text-zinc-300">{$_(`cycle.names.${cycleData.name}`)}</p>
            {#if cycleData.profile}
                <h1 class="leading-6 mb-2">{translateProfileName($_, cycleData.profile)}</h1>
            {/if}

            {#if cycleData.status.estimatedRunTime}
                <p>
                    <Icon src={Clock} class="h-4 w-4 mb-0.5 inline-block text-indigo-500" />
                    <span class="text-sm font-semibold">{$_('cycle.eta.estimated')}</span>
                    <span>{parseDurationToString(cycleData.status.estimatedRunTime)}</span>
                </p>
            {/if}

            {#if cycleData.status.startDate && cycleData.status.estimatedRunTime}
                <p>
                    <Icon src={Clock} class="h-4 w-4 mb-0.5 inline-block text-indigo-500" />
                    <span class="text-sm font-semibold">{$_('cycle.eta.remaining')}</span>
                    <span>{parseDurationToString(cycleData.status.estimatedRunTime - (Date.now() - cycleData.status.startDate) / 1000)}</span>
                </p>
            {/if}
        </Flex>

        <Flex gap={4} class="ml-auto self-start">
            {#if $machine.settings.devMode}
                <Button 
                    class="group self-start" 
                    color="hover:bg-amber-500"
                    ringColor={"ring-amber-500"}
                    on:click={nextStepCycle}
                >
                    {$_('cycle.buttons.nextStep')}
                </Button>
            {/if}
    
            <Button 
                class="group self-start" 
                color="hover:bg-red-500"
                ringColor={"ring-red-500"}
                on:click={stopCycle}
            >
                {$_('cycle.buttons.stop')}
            </Button>
        </Flex>
    </Flex>

    {#if cycleData.additionalInfo}
        <h3 class="leading-[4rem]">
            <Icon src={InformationCircle} class="h-6 w-6 inline mr-1 text-indigo-500"/>
            {$_('cycle.categories.additional_info')}
        </h3>
    
        <Flex gap={2} direction="col">
            {#each cycleData.additionalInfo.map(k => $realtime.io.find(j => j.name == k)) as item}
                {#if item !== undefined}
                    <Gate bind:io={item} editable={false}/>
                {/if}
            {/each}
        </Flex>
    {/if}

    <h3 class="leading-[4rem]">
        <Icon src={Square3Stack3d} class="h-6 w-6 inline mr-1 text-indigo-500"/>
        {$_('cycle.categories.steps')}
    </h3>

    <Flex gap={2} direction={"col"}>
        {#each cycleData.steps.filter(s => s.isEnabled.data == 1) as step}

        {@const icon = step.state === "started" ? ArrowPath : ["partial", "ended", "ending"].includes(step.state) ? Check : XMark}
        {@const iconColor = step.state === "started" ? "text-orange-500" : ["partial", "ended", "ending"].includes(step.state) ? "text-emerald-500" : "text-red-500"}

            <div class="p-4 rounded-xl border-[1px] border-zinc-400">
                <Flex items="center" justify="between">
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
                        {#if step.runCount !== undefined && step.runAmount !== undefined}
                            <Label>{step.runCount} / {step.runAmount.data}</Label>
                        {/if}
                        
                        <Icon src={icon} class="h-6 w-6 self-start {icon === ArrowPath ? "animate-spin-slow" : ""} {iconColor}" />
                    </Flex>

                </Flex>

                {#if step.state === "started"}
                    <p class="text-sm leading-6 mt-1">{$_('progress')}</p> 
                    <div class="bg-zinc-600/50 h-1.5 rounded-full grow relative">
                        {#if step.runAmount}
                            {@const items = step.runAmount.data}
                            {#each Array.from(Array(step.runAmount.data).keys()) as item}
                                <div 
                                    class="h-1.5 w-1.5 absolute top-0 bg-white/50 rounded-full z-10" 
                                    style:left="{(1 / items) * 100 + (item / items) * 100}%"
                                    class:invisible={(item + 2 > items)}
                                    style:transform={"translateX(-50%"}
                                />
                            {/each}
                        {/if}
                        <div 
                            class="h-1.5 rounded-full duration-[2s] transition-all z-20"
                            class:bg-violet-500={step.progress === -1}
                            class:bg-indigo-500={step.state === "started" && step.progress !== -1}
                            style:width={`${step.progress * 100}%`}
                        />
                    </div>
                {/if}

            </div>
        {/each}
    </Flex>

{:else if cycleData !== undefined && ["ending", "ended"].includes(cycleData.status.mode)}

    {@const isSuccess = cycleData.status.endReason === "finished"}

    <Flex justify="between">
        <div>
            <p class="text-sm text-zinc-600 dark:text-zinc-300">{$_('cycle.end.lead')}</p>
            <h1 class="leading-6">{$_(`cycle.end_reasons.${$realtime.cycle?.status.endReason ?? 'error'}`)}</h1>
        
            {#if cycleData.status.endDate && cycleData.status.startDate}
                <p class="leading-10">
                    <Icon src={Clock} class="h-4 w-4 mb-0.5 inline-block" />
                    <span class="text-sm font-semibold">{$_('cycle.end.duration')}</span>
                    <span>{parseDurationToString((cycleData.status.endDate - cycleData.status.startDate) / 1000)}</span>
                </p>
            {/if}
        </div>

        <Icon src={isSuccess ? Check : XMark} class="h-10 w-10 self-start {isSuccess ? "text-emerald-500" : "text-red-500"}" />
    </Flex>


    <Button on:click={patchCycle} class="mt-8">{$_('cycle.buttons.complete')}</Button>
{:else}
    <h3>Loading...</h3>
{/if}
