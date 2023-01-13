<script lang="ts">

    import Flex from "$lib/components/layout/flex.svelte";
    import { _ } from "svelte-i18n";

    import { Square3Stack3d, UserCircle } from "@steeze-ui/heroicons";
    import { Icon } from '@steeze-ui/svelte-icon';
	import Wrapper from "$lib/components/Wrapper.svelte";
	import Cycle from "./Cycle.svelte";
	import { realtime } from "$lib/utils/stores/nuster";
	import type { ProgramBlockRunnerHydrated } from "@metalizzsas/nuster-typings/build/hydrated";
	import { translateProfileName } from "$lib/utils/i18n/i18nprofile";
	import SelectableButton from "$lib/components/buttons/SelectableButton.svelte";
	import type { PageData } from "./$types";

    export let data: PageData;

    let selectedPremadeIndex: number | undefined = undefined;
    let cycleData: ProgramBlockRunnerHydrated | undefined;
    let listShrinked = false;

    const prepareCycle = async (cycleType: string, profileID?: string) => {

        // Patch cycle if cycle data is not undefined
        if(cycleData !== undefined)
            await patchCycle();  

        await fetch(`/api/v1/cycle/${cycleType}/${profileID != undefined ? profileID : ''}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    /** End a prepared cycle if one is defined */
    const patchCycle = async () => {
        cycleData = undefined;

        await fetch(`/api/v1/cycle/0`, { method: "PATCH" });
    }

    /// — Reactives statements 
    $: cycleData = $realtime.cycle;
    $: if(cycleData !== undefined && selectedPremadeIndex === undefined)
    { 
        const index = data.cyclePremades.findIndex(p => p.profile?._id == cycleData?.profile?._id);
        const cycleIndex = data.cyclePremades.findIndex(p => p.cycle === cycleData?.name);

        selectedPremadeIndex = index === -1 ? ((cycleIndex === -1) ? undefined : cycleIndex) : index;

        if(selectedPremadeIndex !== -1 && !["creat"].includes(cycleData.status.mode))
            listShrinked = true;
    }

    $: if(cycleData !== undefined && !cycleData.status.mode.startsWith("creat"))
    { 
        listShrinked = true;
    } 
    else if (cycleData !== undefined)
    { 
        listShrinked = false;
    }
    else
    { 
        listShrinked = false;
    }
</script>

<Flex direction="row" gap={listShrinked ? 0 : 6}>
	<div 
        class="shrink-0 overflow-y-scroll drop-shadow-xl"
        class:max-w-0={listShrinked}
    >
        <Wrapper>
            <Flex direction="col" gap={2}>
                <h1>{$_(`cycle.lead`)}</h1>
                {#each data.cyclePremades as premade, index}
                    {@const isPrimaryPremade = premade.cycle === "default"}

                    <SelectableButton 
                        selected={selectedPremadeIndex === index}
                        on:click={() => {
                            if (selectedPremadeIndex == index) {
                                selectedPremadeIndex = undefined;
                                void patchCycle();

                            } else {
                                selectedPremadeIndex = index;
                                prepareCycle(premade.cycle, premade.profile?._id);
                            }
                        }}
                    >

                        <Flex gap={4} items="center">
                            {#if premade.profile}
                                <Icon
                                    src={premade.profile?.isPremade === true ? Square3Stack3d: UserCircle}
                                    theme="solid"
                                    class="{isPrimaryPremade ? "text-indigo-500" : "text-pink-500"} h-6 w-6"
                                />
                            {:else}
                                <Icon
                                    src={Square3Stack3d}
                                    theme="solid"
                                    class="{isPrimaryPremade ? "text-indigo-500" : "text-pink-500"} h-6 w-6"
                                />
                            {/if}
                            <Flex direction="col" gap={0} items="start" justify="items-start">

                                {#if premade.profile !== undefined}
                                    <h2>{translateProfileName($_, premade.profile)}</h2>
                                    <p class="text-sm text-zinc-600 dark:text-zinc-300">
                                        {$_("cycle.names." + premade.cycle)}
                                    </p>
                                {:else}
                                    <h2>{$_("cycle.names." + premade.cycle)}</h2>
                                {/if}

                            </Flex>
                        </Flex>

                    </SelectableButton>

                {/each}
            </Flex>
        </Wrapper>
	</div>

	<div class="overflow-y-scroll grow drop-shadow-xl">
        <Wrapper>
            {#if selectedPremadeIndex !== undefined && cycleData !== undefined}
                <Cycle on:patched={() => {
                    selectedPremadeIndex = undefined;
                }}/>
            {:else}
                <h3>{$_('cycle.unselected.lead')}</h3>
                <p>
                    {$_('cycle.unselected.sub')}
                    <a href="/help" class="text-indigo-500 font-medium underline-offset-1 underline">{$_('cycle.unselected.help')}</a>
                </p>
            {/if}
        </Wrapper>
	</div>
</Flex>
