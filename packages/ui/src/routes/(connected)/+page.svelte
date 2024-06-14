<script lang="ts">

    import Flex from "$lib/components/layout/flex.svelte";
    import { _ } from "svelte-i18n";

    import { Square3Stack3d, UserCircle } from "@steeze-ui/heroicons";
    import { Icon } from '@steeze-ui/svelte-icon';
	import Wrapper from "$lib/components/Wrapper.svelte";
	import Cycle from "./Cycle.svelte";
	import { realtime } from "$lib/utils/stores/nuster";
	import type { ProgramBlockRunnerHydrated } from "@nuster/turbine/types/hydrated";
	import { translateProfileName } from "$lib/utils/i18n/i18nprofile";
	import SelectableButton from "$lib/components/buttons/SelectableButton.svelte";
	import type { ActionData, PageData } from "./$types";
	import Gate from "$lib/components/io/Gate.svelte";
	import Toggle from "$lib/components/inputs/Toggle.svelte";
	import Label from "$lib/components/Label.svelte";
	import { page } from "$app/stores";
	import { enhance } from "$app/forms";

    export let data: PageData;
    export let form: ActionData;

    let selectedPremadeIndex: number | undefined = undefined;
    let cycleData: ProgramBlockRunnerHydrated | undefined;
    let listShrinked = false;
    let pathCycleButton: HTMLButtonElement;

    /// — Reactives statements 
    $: if(form !== undefined && form?.patchCycle?.success === true) { cycleData =  undefined; selectedPremadeIndex = undefined; }
    $: cycleData = $realtime.cycle;
    $: if(cycleData !== undefined && selectedPremadeIndex === undefined)
    { 
        const index = data.cyclePremades.findIndex(p => p.profile?.id == cycleData?.profile?.id);
        const cycleIndex = data.cyclePremades.findIndex(p => p.cycle === cycleData?.name);

        selectedPremadeIndex = index === -1 ? ((cycleIndex === -1) ? undefined : cycleIndex) : index;

        if(selectedPremadeIndex !== -1 && !["creat"].includes(cycleData.status.mode))
            listShrinked = true;
    }

    $: if(cycleData !== undefined && !cycleData.status.mode.startsWith("creat"))
        listShrinked = true;
    else if (cycleData !== undefined)
        listShrinked = false;
    else
        listShrinked = false;
</script>

<Flex direction="row" gap={listShrinked ? 0 : 6}>
	<div 
        class="shrink-0 drop-shadow-xl"
        class:max-w-0={listShrinked}
        class:max-h-0={listShrinked}
        class:max-w-[40%]={!listShrinked}
        class:overflow-hidden={listShrinked}
    >
        <Wrapper>
            <Flex direction="col" gap={2}>
                <h1>{$_(`cycle.lead`)}</h1>
                {#each data.cyclePremades as premade, index}
                    {@const isPrimaryPremade = premade.cycle === "default"}

                    <form action="?/patchCycle" method="post" use:enhance>
                        <button class="hidden" bind:this={pathCycleButton} />
                    </form>

                    <form action="?/prepareCycle" method="post" use:enhance>
                        <input type="hidden" name="cycle_type" value={premade.cycle} />
                        {#if premade.profile !== undefined}
                            <input type="hidden" name="profile_id" value={premade.profile?.id} /> 
                        {/if}

                        <SelectableButton 
                            selected={selectedPremadeIndex === index}
                            on:click={(e) => { if(selectedPremadeIndex == index) { e.preventDefault(); pathCycleButton.click(); } else { selectedPremadeIndex = index; }}}
                        >
                            <Flex gap={4} items="center">
                                {#if premade.profile}
                                    <Icon
                                        src={premade.profile?.isPremade === true ? Square3Stack3d: UserCircle}
                                        theme="solid"
                                        class="{isPrimaryPremade ? "text-indigo-500" : "text-pink-500"} h-6 w-6 shrink-0"
                                    />
                                {:else}
                                    <Icon
                                        src={Square3Stack3d}
                                        theme="solid"
                                        class="{isPrimaryPremade ? "text-indigo-500" : "text-pink-500"} h-6 w-6 shrink-0"
                                    />
                                {/if}
                                <Flex direction="col" gap={0} items="start" justify="items-start">

                                    {#if premade.profile !== undefined}
                                        <h2 class="text-ellipsis text-left">{translateProfileName($_, premade.profile)}</h2>
                                        <p class="text-sm text-zinc-600 dark:text-zinc-300">
                                            {$_("cycle.names." + premade.cycle)}
                                        </p>
                                    {:else}
                                        <h2>{$_("cycle.names." + premade.cycle)}</h2>
                                    {/if}

                                </Flex>
                            </Flex>
                        </SelectableButton>
                    </form>
                {/each}
            </Flex>
        </Wrapper>
	</div>

	<div class="grow drop-shadow-xl">
        <Flex gap={6} direction="col">
            <Wrapper>
                {#if selectedPremadeIndex !== undefined && cycleData !== undefined}
                    <Cycle />
                {:else}
                    <h3>{$_('cycle.unselected.lead')}</h3>
                    <p class="mt-2">
                        {$_('cycle.unselected.sub')}
                        <a href="/help" class="text-indigo-500 font-medium underline-offset-1 underline">{$_('cycle.unselected.help')}</a>
                    </p>
                {/if}
            </Wrapper>

            {#if selectedPremadeIndex === undefined && cycleData === undefined && $page.data.machine_configuration.nuster?.homeInformations !== undefined}
                <Wrapper>
                    <h3>{$_('cycle.unselected_informations.lead')}</h3>
                    <p class="mt-2 mb-6">{$_('cycle.unselected_informations.sub')}</p>

                    <Flex direction="col">
                        {#each $page.data.machine_configuration.nuster.homeInformations as homeInfo}
                            {#if homeInfo.type === "io"}
                                {@const gate = $realtime.io.find(k => k.name === homeInfo.path)}
                                {#if gate !== undefined}
                                    <Gate io={gate} editable={false}/>
                                {/if}
                            {:else if homeInfo.type === "container.regulation.state"}
                                {@const regulationState = $realtime.containers.find(k => k.name === homeInfo.path.at(0))?.regulations?.find(k => k.name === homeInfo.path.at(1))?.state}
                                {#if regulationState !== undefined}
                                    <Flex items="center">
                                        <p>{$_(`containers.${homeInfo.path[0]}.regulations.${homeInfo.path[1]}`)} → {$_('container.regulation.enabled')}</p>
                                        <div class="h-[1px] grow bg-zinc-500/50" />
                                        <Toggle value={regulationState} locked={true}/>
                                    </Flex>
                                {/if}
                            {:else if homeInfo.type === "container.regulation.target"}
                                {@const regulation = $realtime.containers.find(k => k.name === homeInfo.path.at(0))?.regulations?.find(k => k.name === homeInfo.path.at(1))}
                                {#if regulation !== undefined}
                                    <Flex items="center">
                                        <p>{$_(`containers.${homeInfo.path[0]}.regulations.${homeInfo.path[1]}`)} → {$_('container.regulation.target')}</p>
                                        <div class="h-[1px] grow bg-zinc-500/50" />
                                        <Label>{regulation.target} <span class="font-semibold">{regulation.currentUnity}</span></Label>
                                    </Flex>
                                {/if}
                            {/if}
                        {/each}
                    </Flex>
                </Wrapper>
            {/if}
        </Flex>
	</div>
</Flex>
