<script lang="ts">
    
    import Button from "$lib/components/buttons/Button.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
	import Gate from "./io/Gate.svelte";
	import CycleStep from "./CycleStep.svelte";

    import { parseDurationToString } from "$lib/utils/dateparser";
    import { ArrowRight, Check, CheckCircle, Clock, ExclamationCircle, Forward, InformationCircle, Pause, Play, Square3Stack3d, Stop, XMark } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
	import { _ } from "svelte-i18n";
	import { translateProfileName } from "$lib/utils/i18n/i18nprofile";
	import { machine, realtime } from "$lib/utils/stores/nuster";
	import { createEventDispatcher } from "svelte";
    
    const dispatch = createEventDispatcher<{ patched: void }>();

    export let patched = () => { dispatch("patched"); }
    
    const startCycle = async () => {

        if(cycleData === undefined)
            return;
        
        if(cycleData.runConditions.some(c => c.result === "error"))
            return;

        await fetch(`/api/v1/cycle`, { method: "POST" });
    }

    const stopCycle = async () => {
        await fetch(`/api/v1/cycle`, { method: "DELETE" });
    }

    const nextStepCycle = async () => {
        await fetch(`/api/v1/cycle`, { method: "PUT"});
    }

    const pauseCycle = async () => {
        if($machine.model !== "uscleaner")
            return;

        await fetch(`/api/v1/cycle/pause`, { method: "PUT" });
    }

    const patchCycle = () => {
        patched();
        void fetch(`/api/v1/cycle`, { method: "PATCH" });
    }

    /// — Reactive statements
    $: cycleData = $realtime.cycle;

</script>

{#if cycleData !== undefined && cycleData.status.mode === "created"}

    {@const ready = !cycleData.runConditions.some(k => k.result === "error")}
    {@const readyWarn = cycleData.runConditions.some(k => k.result === "warning")}

    {#if cycleData.profile}
        <p class="text-sm text-zinc-600 dark:text-zinc-300 -mb-1">{$_(`cycle.names.${cycleData.name}`)}</p>
        <h1>{translateProfileName($_, cycleData.profile)}</h1>
    {:else}
        <h1>{$_(`cycle.names.${cycleData.name}`)}</h1>
    {/if}

    {#if cycleData !== undefined && cycleData.status.estimatedRunTime !== undefined}
        <p class="mt-3 mb-2">
            <Icon src={Clock} class="h-5 w-5 mr-0.5 mb-0.5 inline-block text-indigo-500" />
            <span class="font-semibold">{$_('cycle.eta.estimated')}</span>
            {#if cycleData.status.estimatedRunTime === null}
                <span>{$_('cycle.eta.null')}</span>
            {:else}
                <span>{parseDurationToString(cycleData.status.estimatedRunTime)}</span>
            {/if}
        </p>
    {/if}

    {#if ready && readyWarn}
        <p class="mb-6">
            <Icon src={ExclamationCircle} class="h-5 w-5 mr-0.5 mb-0.5 inline-block text-amber-500" />
            {$_('cycle.run_conditions_warning')}
        </p>
    {/if}

    <Button 
        class="group self-start mb-2" 
        color={ready ? (readyWarn ? "hover:bg-amber-500" : "hover:bg-emerald-500") : "hover:bg-red-500"}
        ringColor={ready ? (readyWarn ? "ring-amber-500" : "ring-emerald-500") : "ring-red-500"}
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
            class:text-red-500={cycleData.runConditions.filter(k => k.result == "error").length > 0}
            class:text-amber-500={cycleData.runConditions.filter(k => k.result == "warning").length > 0}
            class:text-emerald-500={cycleData.runConditions.filter(k => k.result == "good").length > 0}
        >
            <Icon src={ready ? CheckCircle : ExclamationCircle} theme="solid" class="h-7 w-7 -ml-1.5 translate-x-1.5 grow {ready ? ((readyWarn) ? "text-amber-500" : "text-emerald-500") : "text-red-500"}" />
        </div>

    </Flex>

    <Flex direction="col" gap={0.5}>
        {#each cycleData.runConditions.filter(sc => sc.result != "disabled") as sc}
            <Flex direction="row" items="center">
                <span>{$_(`cycle.run_conditions.${sc.name}`)}</span>
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

{:else if cycleData !== undefined && (cycleData.status.mode === "started" || cycleData.status.mode === "paused")}
    <Flex>
        <Flex direction="col" gap={1}>
            <p class="text-sm text-zinc-600 dark:text-zinc-300">{$_(`cycle.names.${cycleData.name}`)}</p>
            {#if cycleData.profile}
                <h1 class="leading-6 mb-2">{translateProfileName($_, cycleData.profile)}</h1>
            {/if}

            {#if cycleData.status.mode === "paused"}
                <h2 class="leading-4 mb-2 text-amber-500 animate-pulse"><Icon src={ExclamationCircle} class="inline h-5 w-5 mr-2 mb-0.5" />Cycle en pause</h2>
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
                    <span>{parseDurationToString((cycleData.status.estimatedRunTime + (cycleData.status.overallPausedTime ?? 0)) - (Date.now() - cycleData.status.startDate) / 1000)}</span>
                </p>
            {/if}

            {#if cycleData.status.overallPausedTime !== undefined && cycleData.status.overallPausedTime > 0}
                <p>
                    <Icon src={Clock} class="h-4 w-4 mb-0.5 inline-block text-yellow-500" />
                    <span class="text-sm font-semibold">{$_('cycle.eta.paused')}</span>
                    <span>{parseDurationToString(cycleData.status.overallPausedTime)}</span>
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
                    disabled={cycleData.status.mode === "paused"}
                >
                    <Icon src={Forward} class="h-5 w-5 mb-0.5 mr-1 inline" />
                    {$_('cycle.buttons.nextStep')}
                </Button>
            {/if}

            {#if cycleData.status.pausable && $machine.model === "uscleaner"}
                <Button 
                    class="group self-start" 
                    color="hover:bg-yellow-500"
                    ringColor={"ring-yellow-500"}
                    on:click={pauseCycle}
                >
                    <Icon src={cycleData.status.mode === "paused" ? Play : Pause} class="h-5 w-5 mr-1 mb-0.5 inline" />
                    {$_(`cycle.buttons.${cycleData.status.mode === "paused" ? "resume" : "pause"}`)}
                </Button>
            {/if}
    
            <Button 
                class="group self-start" 
                color="hover:bg-red-500"
                ringColor={"ring-red-500"}
                on:click={stopCycle}
                disabled={cycleData.status.mode === "paused"}
            >
                <Icon src={Stop} class="h-5 w-5 mr-1 mb-0.5 inline" />
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

    <h3 class="leading-[4rem] mt-2">
        <Icon src={Square3Stack3d} class="h-6 w-6 inline mr-1 text-indigo-500"/>
        {$_('cycle.categories.steps')}
    </h3>

    <Flex gap={2} direction={"col"}>
        {#each cycleData.steps.filter(s => s.isEnabled.data == 1) as step}
            <CycleStep {step} />
        {/each}
    </Flex>

{:else if cycleData !== undefined && ["ending", "ended"].includes(cycleData.status.mode)}

    {@const isSuccess = cycleData.status.endReason === "finished"}
    {@const hasOneStepErrored = cycleData.status.endReason === "finished" && cycleData.steps.some(s => s.state === "crashed" && s.endReason != "ending")}

    <Flex justify="between">
        <div>
            <p class="text-sm text-zinc-600 dark:text-zinc-300">{$_('cycle.end.lead')}</p>
            <h1 class="leading-6">{$_(`cycle.end_reasons.${(!hasOneStepErrored) ? ($realtime.cycle?.status.endReason ?? 'error') : 'error'}`)}</h1>
        
            {#if cycleData.status.endDate && cycleData.status.startDate}
                <p class="leading-10">
                    <Icon src={Clock} class="h-4 w-4 mb-0.5 inline-block text-indigo-500" />
                    <span class="text-sm font-semibold">{$_('cycle.end.duration')}</span>
                    <span>{parseDurationToString((cycleData.status.endDate - cycleData.status.startDate) / 1000)}</span>
                </p>
            {/if}

            {#if cycleData.status.overallPausedTime !== undefined && cycleData.status.overallPausedTime > 0}
                <p>
                    <Icon src={Clock} class="h-4 w-4 mb-0.5 inline-block text-yellow-500" />
                    <span class="text-sm font-semibold">{$_('cycle.eta.paused')}</span>
                    <span>{parseDurationToString(cycleData.status.overallPausedTime)}</span>
                </p>
            {/if}

        </div>

        <Icon src={isSuccess && !hasOneStepErrored ? Check : XMark} class="h-10 w-10 self-start {isSuccess && !hasOneStepErrored ? "text-emerald-500" : "text-red-500"}" />
    </Flex>

    <Button on:click={patchCycle} class="mt-4 mb-6">{$_('cycle.buttons.complete')}</Button>

    <div class="h-0.5 bg-zinc-300/50 rounded-full mx-auto w-2/3 my-2" />

    <div>
        <h3 class="leading-[4rem] mt-2">
            <Icon src={Square3Stack3d} class="h-6 w-6 inline mr-1 text-indigo-500"/>
            {$_('cycle.categories.steps')}
        </h3>
        
        <Flex gap={2} direction={"col"}>
            {#each cycleData.steps.filter(s => s.isEnabled.data == 1) as step (step.name)}
                <CycleStep {step} />
            {/each}
        </Flex>
    </div>
{:else}
    <h3>Loading...</h3>
{/if}
