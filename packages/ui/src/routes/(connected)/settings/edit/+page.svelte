<script lang="ts">
	import Flex from "$lib/components/layout/flex.svelte";
	import Grid from "$lib/components/layout/grid.svelte";
	import Button from "$lib/components/buttons/Button.svelte";
	import NumField from "$lib/components/inputs/NumField.svelte";
	import Select from "$lib/components/inputs/Select.svelte";
	import TextField from "$lib/components/inputs/TextField.svelte";
	import Wrapper from "$lib/components/Wrapper.svelte";
	import PageHeader from "$lib/components/PageHeader.svelte";
	import Toggle from "$lib/components/inputs/Toggle.svelte";
	import SettingField from "../SettingField.svelte";

    import type { PageData } from "./$types";
	import ToggleGroup from "$lib/components/inputs/ToggleGroup.svelte";
	import { enhance } from "$app/forms";

    let { data }: { data: PageData } = $props();

    let specs = $derived(data.configurations[data.configuration.model]);
</script>

<PageHeader title="Machine Configuration" back="/settings" />

<Flex direction="col" gap={4}>

    <Wrapper>
        <Flex direction="col" gap={2}>
            <h2>Model choice</h2>
            <p class="text-sm text-zinc-500 dark:text-zinc-400">Base model settings</p>

            <SettingField label={"Model"}>
                <Select
                    bind:value={data.configuration.model}
                    selectableValues={Object.keys(data.configurations).map(k => { return { name: k, value: k }})}
                />
            </SettingField>

            {#if specs !== undefined}
                <SettingField label={"Name"}><TextField bind:value={data.configuration.name} /></SettingField>
                <SettingField label={"Serial"}><TextField bind:value={data.configuration.serial} /></SettingField>
            {/if}
        </Flex>
    </Wrapper>

    {#if specs !== undefined}

        {#if specs.addons !== undefined}
            <Wrapper>
                <Flex direction="col" gap={2}>
                    <h2>Addons</h2>
                    <p class="text-sm text-zinc-500 dark:text-zinc-400">Addons are small specs parts that are added to base specs.</p>

                    {#each specs.addons as item}
                        <SettingField label={item.addonName}>
                            <ToggleGroup bind:group={data.configuration.addons} value={item.addonName} />
                        </SettingField>
                    {/each}
                </Flex>
            </Wrapper>
        {/if}

        <Wrapper>
            <Flex direction="col" gap={2}>
                <h2>Settings</h2>
                <p class="text-sm text-zinc-500 dark:text-zinc-400">These settings mostly affects how UI reacts.</p>

                <SettingField label={"Dev Mode"}><Toggle bind:value={data.configuration.settings.devMode} /></SettingField>
                <SettingField label={"Profiles shown"}><Toggle bind:value={data.configuration.settings.profilesShown} /></SettingField>
                <SettingField label={"Only show selected profile rows"}><Toggle bind:value={data.configuration.settings.onlyShowSelectedProfileFields} /></SettingField>
                <SettingField label={"Hide Multilayer informations"}><Toggle bind:value={data.configuration.settings.hideMultilayerIndications} /></SettingField>
            </Flex>
        </Wrapper>

        {#if specs.variables.length > 0}
            <Wrapper>
                <Flex direction="col" gap={2}>
                    <Flex items="center" justify="between">
                        <div>
                            <h2>Machine Variables</h2>
                            <p class="text-sm text-zinc-500 dark:text-zinc-400">Machine variables are used by programs, these settings are nearly unique for each machine.</p>
                        </div>
                        <Button
                            size="small"
                            color="hover:bg-indigo-500"
                            ringColor="ring-indigo-500"
                            onclick={() => {
                                data.configuration.settings.variables = [...data.configuration.settings.variables, {name: "new var name", value: 0}];
                            }}
                        >
                            Add a variable
                        </Button>
                    </Flex>

                    {#each data.configuration.settings.variables as variable}
                        <Grid cols={6}>
                            <Flex direction="col" gap={0.5} class="col-span-3">
                                <span class="text-xs text-zinc-500 dark:text-zinc-400">Variable name</span>
                                <Select
                                    bind:value={variable.name}
                                    selectableValues={specs.variables.filter(k => variable.name === k || data.configuration.settings.variables.find(j => j.name === k) === undefined).map(k => { return { name: k, value: k}})}
                                />
                            </Flex>

                            <Flex direction="col" gap={0.5} class="col-span-2">
                                <span class="text-xs text-zinc-500 dark:text-zinc-400">Variable value</span>
                                <NumField bind:value={variable.value}/>
                            </Flex>

                            <Button size="small" class="self-end" color="hover:bg-red-500" ringColor="ring-red-500" onclick={() => { data.configuration.settings.variables = data.configuration.settings.variables.filter(k => k !== variable)}}>Delete</Button>
                        </Grid>
                    {/each}
                </Flex>
            </Wrapper>
        {/if}

        <Wrapper>
            <Flex direction="col" gap={2}>
                <h2>Raw configuration</h2>
                <p class="text-sm text-zinc-500 dark:text-zinc-400">This is the raw <span class="rounded-md bg-zinc-200/70 px-1.5 py-0.5 font-medium dark:bg-zinc-700/60">info.json</span> file.</p>

                <div class="rounded-xl border border-border bg-zinc-50 p-4 dark:bg-zinc-900/60">
                    <pre class="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">{JSON.stringify({...data.configuration, $schema: undefined }, undefined, 4)}</pre>
                </div>
                <Grid cols={2} class="mt-2">
                    <form action="?/saveConfiguration" method="post" use:enhance>
                        <input type="hidden" name="configuration" value={JSON.stringify(data.configuration)} />
                        <Button class="w-full">Save</Button>
                    </form>
                    <a href="/settings">
                        <Button color="hover:bg-red-500" ringColor="ring-red-500" class="w-full">Exit</Button>
                    </a>
                </Grid>
            </Flex>
        </Wrapper>

    {/if}

</Flex>
