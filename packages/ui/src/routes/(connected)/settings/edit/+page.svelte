<script lang="ts">
	import Flex from "$lib/components/layout/flex.svelte";
	import Grid from "$lib/components/layout/grid.svelte";
	import Button from "$lib/components/buttons/Button.svelte";
	import NumField from "$lib/components/inputs/NumField.svelte";
	import Select from "$lib/components/inputs/Select.svelte";
	import TextField from "$lib/components/inputs/TextField.svelte";
	import Wrapper from "$lib/components/Wrapper.svelte";
	import Toggle from "$lib/components/inputs/Toggle.svelte";
	import SettingField from "../SettingField.svelte";

    import type { PageData } from "./$types";
	import ToggleGroup from "$lib/components/inputs/ToggleGroup.svelte";
	import { enhance } from "$app/forms";
    export let data: PageData;

    /// — Reactive statements
    $: specs = data.configurations[data.configuration.model];
</script>

<Wrapper>
    
    <h1>Machine Configuration</h1>
    
    <Flex direction="col" gap={2}>

        <h2>Model choice</h2>
        <p>Base model settings</p>

        <SettingField label={"Model"}>
            <Select 
                bind:value={data.configuration.model}
                selectableValues={Object.keys(data.configurations).map(k => { return { name: k, value: k }})}
            />
        </SettingField>

        {#if specs !== undefined}
            
            <h2>Informations data</h2>

            <SettingField label={"Name"}><TextField bind:value={data.configuration.name} /></SettingField>
            <SettingField label={"Serial"}><TextField bind:value={data.configuration.serial} /></SettingField>

            {#if specs.addons !== undefined}
                <h2>Addons</h2>
                <p>Addons are small specs parts that are added to base specs.</p>
        
                {#each specs.addons as item}
                    <SettingField label={item.addonName}>
                        <ToggleGroup bind:group={data.configuration.addons} value={item.addonName} />
                    </SettingField>
                {/each}
            {/if}

            <h2>Settings</h2>

            <p>These settings mostly affects how UI reacts.</p>
            
            <SettingField label={"Dev Mode"}><Toggle bind:value={data.configuration.settings.devMode} /></SettingField>
            <SettingField label={"Profiles shown"}><Toggle bind:value={data.configuration.settings.profilesShown} /></SettingField>
            <SettingField label={"Only show selected profile rows"}><Toggle bind:value={data.configuration.settings.onlyShowSelectedProfileFields} /></SettingField>
            <SettingField label={"Hide Multilayer informations"}><Toggle bind:value={data.configuration.settings.hideMultilayerIndications} /></SettingField>

            {#if specs.variables.length > 0}
                <h2>Machine Variables</h2>
                <p>Machine variables are used by programs, these settings are nearly unique for each machine.</p>
        
                <Button
                    on:click={() => {
                        data.configuration.settings.variables = [...data.configuration.settings.variables, {name: "new var name", value: 0}];
                    }}
                    class="self-end"
                >
                    Add a variable
                </Button>
        
                {#each data.configuration.settings.variables as variable}
                    <Grid cols={6}>
                        <Flex direction="col" gap={0.5} class="col-span-3">
                            <span class="text-xs">Variable name</span>
                            <Select
                                bind:value={variable.name}
                                selectableValues={specs.variables.filter(k => variable.name === k || data.configuration.settings.variables.find(j => j.name === k) === undefined).map(k => { return { name: k, value: k}})}
                            />
                        </Flex>
        
                        <Flex direction="col" gap={0.5} class="col-span-2">
                            <span class="text-xs">Variable value</span>
                            <NumField bind:value={variable.value}/>
                        </Flex>
                        
                        <Button class="self-end" color="hover:bg-red-500" ringColor="ring-red-500" on:click={() => { data.configuration.settings.variables = data.configuration.settings.variables.filter(k => k !== variable)}}>Delete</Button>
                    </Grid>
                {/each}
            {/if}

            <h2>Raw configuration</h2>
            <p>This is the raw <span class="px-1.5 py-0.5 bg-zinc-300/50 dark:bg-zinc-600/50 font-medium rounded-md">info.json</span> file.</p>

            <div class="p-4 rounded-xl ring-zinc-400/50 ring-1">
                <pre class="break-words whitespace-pre-wrap">{JSON.stringify({...data.configuration, $schema: undefined }, undefined, 4)}</pre>
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

        {/if}

    </Flex>
</Wrapper>