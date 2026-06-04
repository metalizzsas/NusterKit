<script lang="ts">
	import type { IOGateJSON } from "$lib/types/turbine";

	import Flex from "$lib/components/layout/flex.svelte";
	import Gate from "$lib/components/io/Gate.svelte";

	import { CheckCircle, ExclamationCircle } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";

	import { realtime } from "$lib/utils/stores/nuster";

	import { _ } from "svelte-i18n";
	import { computeContainersState } from "$lib/utils/state";
	import ContainerRegulation from "$lib/components/container/ContainerRegulation.svelte";
	import ContainerProduct from "$lib/components/container/ContainerProduct.svelte";
	import type { PageData } from "./$types";
	import Wrapper from "$lib/components/Wrapper.svelte";

    let { data }: { data: PageData } = $props();

    type categoriesTypes = "products" | "sensors" | "regulation";

    const sensorIOFilter = (k: IOGateJSON | undefined): k is IOGateJSON => { return k !== undefined };

    let container = $derived($realtime.containers.find(c => c.name === data.container.name));
    let containerState = $derived(container ? computeContainersState(container, $realtime.io) : { issues: [], infos: [], result: "good" as const });
    let sensorIO = $derived(container?.sensors ? container.sensors.map(s => $realtime.io.find(i => i.name == s.io)).filter(sensorIOFilter) : []);

    let categories = $derived.by(() => {
        if (!container) return [];
        let cats: Array<categoriesTypes> = [];
        if (container.isProductable || ((container.callToAction?.length ?? 0) > 0)) cats = [...cats, "products"];
        if (container.sensors) cats = [...cats, "sensors"];
        if (container.regulations) cats = [...cats, "regulation"];
        return cats;
    });
</script>

{#if container}
<Wrapper>
    <Flex direction="col" gap={4}>
        <div class="flex items-start justify-between gap-4">
            <h2 class="text-xl">{$_(`containers.${container.name}.name`)}</h2>
            <Icon
                src={containerState.issues.length > 0 ? ExclamationCircle : CheckCircle}
                theme="solid"
                class={containerState.issues.length > 0 ? "h-7 w-7 shrink-0 text-amber-500" : "h-7 w-7 shrink-0 text-emerald-500"}
            />
        </div>

        {#if containerState.issues.length > 0}
            <div class="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
                <p class="text-sm font-medium text-amber-700 dark:text-amber-400">{$_('container.state.lead.error')}</p>
                <ul class="mt-1 flex flex-col gap-0.5">
                    {#each containerState.issues as error (error)}
                        <li class="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                            <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"></span>
                            {$_(`container.state.issues.${error}`)}
                        </li>
                    {/each}
                </ul>
            </div>
        {:else}
            <p class="text-sm text-zinc-600 dark:text-zinc-300">{$_('container.state.lead.good')}</p>
        {/if}

        {#each categories as category (category)}
            <section>
                <Flex items="center" gap={3} class="mb-3">
                    <h3 class="shrink-0 text-base font-semibold">
                        {$_(`container.category.${category}`)}
                        {#if category === "sensors"}
                            <span class="font-normal text-sm text-zinc-500 dark:text-zinc-400">({container.sensors?.length})</span>
                        {/if}
                    </h3>
                    <div class="h-px grow bg-border"></div>
                </Flex>

                {#if category === "products"}
                    <ContainerProduct bind:container />
                {:else if category === "sensors"}
                    <Flex direction="col" gap={2}>
                        {#each sensorIO as gate (gate.name)}
                            <Gate io={gate} editable={false} />
                        {/each}
                    </Flex>
                {:else if category === "regulation" && container.regulations !== undefined}
                    <ContainerRegulation bind:container />
                {/if}
            </section>
        {/each}
    </Flex>
</Wrapper>
{/if}
