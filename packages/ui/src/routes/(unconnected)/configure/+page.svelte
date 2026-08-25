<script lang="ts">

    import "$lib/app.css";
    import "@fontsource/inter/400.css";
    import "@fontsource/inter/500.css";
    import "@fontsource/inter/600.css";
    import "@fontsource/inter/700.css";
    import "@fontsource/inter/800.css";
    import "@fontsource/inter/900.css";

	import Flex from "$lib/components/layout/flex.svelte";
	import Grid from "$lib/components/layout/grid.svelte";
	import Button from "$lib/components/buttons/Button.svelte";
	import NumField from "$lib/components/inputs/NumField.svelte";
	import Select from "$lib/components/inputs/Select.svelte";
	import TextField from "$lib/components/inputs/TextField.svelte";
	import Wrapper from "$lib/components/Wrapper.svelte";
	import Toggle from "$lib/components/inputs/Toggle.svelte";
	import SettingField from "../../(connected)/settings/SettingField.svelte";

    import type { PageData } from "./$types";
	import ToggleGroup from "$lib/components/inputs/ToggleGroup.svelte";
	import { enhance } from "$app/forms";

    let { data }: { data: PageData } = $props();

    // Local $state copy, deliberately. `data` comes from $props() and is not
    // deeply reactive: mutating data.configuration.model through bind:value
    // notified nothing, so the derived specs never recomputed, the raw preview
    // never refreshed, and — worse — the hidden field still carried the
    // configuration as loaded. Editing anything silently saved the old values.
    let configuration = $state(structuredClone(data.configuration));

    let specs = $derived(data.configurations[`${configuration.model}`]);
</script>

<Wrapper>

    <h1>Machine Configuration</h1>

    <Flex direction="col" gap={2}>

        <h2>Model choice</h2>
        <p>Base model settings</p>

        <SettingField label={"Model"}>
            <Select
                bind:value={configuration.model}
                selectableValues={Object.keys(data.configurations).map(k => { return { name: k, value: k}})}
            />
        </SettingField>

        {#if specs !== undefined}

            <h2>Informations data</h2>

            <SettingField label={"Name"}><TextField bind:value={configuration.name} /></SettingField>
            <SettingField label={"Serial"}><TextField bind:value={configuration.serial} /></SettingField>

            {#if specs.addons !== undefined}
                <h2>Addons</h2>
                <p>Addons are small specs parts that are added to base specs.</p>

                {#each specs.addons as item}
                    <SettingField label={item.addonName}>
                        <ToggleGroup bind:group={configuration.addons} value={item.addonName} />
                    </SettingField>
                {/each}
            {/if}

            <h2>Settings</h2>

            <p>These settings mostly affects how UI reacts.</p>

            <SettingField label={"Dev Mode"}><Toggle bind:value={configuration.settings.devMode} /></SettingField>
            <SettingField label={"Profiles shown"}><Toggle bind:value={configuration.settings.profilesShown} /></SettingField>

            <SettingField label={"Only show selected profile fileds"}><Toggle bind:value={configuration.settings.onlyShowSelectedProfileFields} /></SettingField>
            <SettingField label={"Hide multilayer informations"}><Toggle bind:value={configuration.settings.hideMultilayerIndications} /></SettingField>

            {#if specs.variables.length > 0}
                <h2>Machine Variables</h2>
                <p>Machine variables are used by programs, these settings are nearly unique for each machine.</p>

                <Button
                    onclick={() => {
                        configuration.settings.variables = [...configuration.settings.variables, {name: "new var name", value: 0}];
                    }}
                    class="self-end"
                >
                    Add a variable
                </Button>

                {#each configuration.settings.variables as variable}
                    <Grid cols={6}>
                        <Flex direction="col" gap={0.5} class="col-span-3">
                            <span class="text-xs">Variable name</span>
                            <Select
                                bind:value={variable.name}
                                selectableValues={specs.variables.filter(k => variable.name === k || configuration.settings.variables.find(j => j.name === k) === undefined).map(k => { return { name: k, value: k}})}
                            />
                        </Flex>

                        <Flex direction="col" gap={0.5} class="col-span-2">
                            <span class="text-xs">Variable value</span>
                            <NumField bind:value={variable.value}/>
                        </Flex>

                        <Button class="self-end" color="hover:bg-red-500" ringColor="ring-red-500" onclick={() => { configuration.settings.variables = configuration.settings.variables.filter(k => k !== variable)}}>Delete</Button>
                    </Grid>
                {/each}
            {/if}

            <h2>Raw configuration</h2>
            <p>This is the raw <span class="px-1.5 py-0.5 bg-zinc-300/50 dark:bg-zinc-600/50 font-medium rounded-md">info.json</span> file.</p>

            <div class="p-4 rounded-xl ring-zinc-400/50 ring-1">
                <pre class="break-words whitespace-pre-wrap">{JSON.stringify({...configuration, $schema: undefined }, undefined, 4)}</pre>
            </div>
            <Grid cols={2}>
                <form action="?/saveConfiguration" use:enhance method="post">
                    <input type="hidden" name="configuration" value={JSON.stringify(configuration)} />
                    <Button class="w-full">Save</Button>
                </form>
                <a href="/settings">
                    <Button color="hover:bg-red-500" ringColor="ring-red-500" class="w-full">Exit</Button>
                </a>
            </Grid>

        {/if}

    </Flex>
</Wrapper>
