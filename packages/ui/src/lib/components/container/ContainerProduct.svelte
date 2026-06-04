<script lang="ts">
	import type { ContainerHydrated } from "$lib/types/turbine";

	import Button from "$lib/components/buttons/Button.svelte";
	import Select from "$lib/components/inputs/Select.svelte";
	import Flex from "$lib/components/layout/flex.svelte";
	import Grid from "$lib/components/layout/grid.svelte";

	import { ArrowDownTray, ArrowRight } from "@steeze-ui/heroicons";
	import { transformDate } from "$lib/utils/dateparser";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { date, time, _ } from "svelte-i18n";
	import { enhance } from "$app/forms";

    let { container = $bindable() }: { container: ContainerHydrated } = $props();

    let methods: string[] = $state([]);

    let selectedProduct: string | undefined = $state(undefined);
    let selectedMethod: string | undefined = $state(undefined);

    $effect(() => {
        methods = [
            container.isProductable ? "load" : undefined,
            ...(container.callToAction ?? []).map(cta => cta.name),
            container.isProductable ? "unload" : undefined
        ].filter(k => k !== undefined).filter((k, i, a) => a.indexOf(k) === i);
    });
</script>

<Flex direction="col" gap={2}>
    {#if container.productData !== undefined}
        <section>
            <h4 class="leading-10 font-semibold text-base">{$_('container.product.informations.lead')}</h4>
            <p>
                <span class="font-medium">{$_('container.product.informations.loaded_product')}</span>
                {$_(`container.product.informations.product_series.${container.productData.loadedProductType}`)}.
            </p>
            <p>
                <span class="font-medium">{$_('container.product.informations.load_date')}</span>
                {$date(Date.parse(container.productData.loadDate), { format: "medium"})} — {$time(Date.parse(container.productData.loadDate), {format: "medium"})}.
            </p>
            <p>
                <span class="font-medium">{$_('container.product.informations.lifetime_remaining')}</span>
                {transformDate($_, container.productData.lifetimeRemaining)}.
            </p>
        </section>
    {/if}

    <section>

        <h4 class="leading-10 font-semibold text-base">{$_('container.product.action.lead')}</h4>

        {#if selectedMethod === undefined}
            <Grid cols={1} gap={4}>
                {#each methods as method}
                    {@const needProduct = method !== "unload"}
                    {@const cta = container.callToAction?.find(c => c.name === method)}

                    {#if cta !== undefined || needProduct === false}
                        <form action="?/updateContainerProduct" method="post" use:enhance>
                            <input type="hidden" name="action_type" value={cta?.name || method} />
                            <Button
                                class="w-full"
                                ringColor={`${method === "unload" ? "ring-red-500" : (method === "load" ? "ring-emerald-500" : 'ring-amber-500')}`}
                                color={`${method === "unload" ? "hover:bg-red-500" : (method === "load" ? "hover:bg-emerald-500" : 'hover:bg-amber-500')}`}
                            >
                                <Flex direction="row" justify="center" items="center">
                                    <Icon src={ArrowDownTray} class="h-4 w-4"/>
                                    {$_(`containers.${container.name}.actions.${cta?.name || method}`)}
                                </Flex>
                            </Button>
                        </form>
                    {:else}
                        <Button
                            onclick={() => selectedMethod = method }
                            ringColor={`${method === "unload" ? "ring-red-500" : (method === "load" ? "ring-emerald-500" : 'ring-amber-500')}`}
                            color={`${method === "unload" ? "hover:bg-red-500" : (method === "load" ? "hover:bg-emerald-500" : 'hover:bg-amber-500')}`}
                        >
                            <Flex direction="row" justify="center" items="center">
                                <Icon src={ArrowDownTray} class="h-4 w-4"/>
                                {$_(`containers.${container.name}.actions.${method}`)}
                            </Flex>
                        </Button>
                    {/if}
                {/each}
            </Grid>
        {:else if selectedMethod !== undefined}
            <div class="rounded-xl border border-border bg-zinc-50/80 p-4 dark:bg-zinc-900/40">
                <p class="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    {$_('container.product.action.product_choose')}
                </p>

                <form
                    action="?/updateContainerProduct"
                    method="post"
                    class="flex flex-col gap-3"
                    use:enhance={() => {
                        return async ({ update, result }) => {
                            await update();
                            if (result.type === "success") {
                                selectedMethod = undefined;
                                selectedProduct = undefined;
                            }
                        };
                    }}
                >
                    <input type="hidden" name="action_type" value={selectedMethod} />
                    <Select
                        bind:value={selectedProduct}
                        selectableValues={container.supportedProductSeries.map(k => { return {
                            name: $_(`container.product.informations.product_series.${k}`),
                            value: k
                        }})}
                        class="w-full"
                        form={{ name: "product" }}
                    />

                    <Flex gap={2} justify="end">
                        <button
                            type="button"
                            class="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white"
                            onclick={() => { selectedMethod = undefined; selectedProduct = undefined; }}
                        >
                            {$_('cancel')}
                        </button>

                        <button
                            type="submit"
                            disabled={selectedProduct === undefined}
                            class="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-600 disabled:pointer-events-none disabled:opacity-40"
                        >
                            {$_(`containers.${container.name}.actions.${selectedMethod}`)}
                            <Icon src={ArrowRight} theme="mini" class="h-4 w-4" />
                        </button>
                    </Flex>
                </form>
            </div>
        {/if}
    </section>
</Flex>
