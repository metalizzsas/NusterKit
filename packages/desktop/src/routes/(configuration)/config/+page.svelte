<script lang="ts">
	import Button from "$lib/components/button.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Navcontainer from "$lib/components/navigation/navcontainer.svelte";
	import Inputkb from "$lib/components/userInputs/inputkb.svelte";
    import { Linker } from "$lib/utils/stores/linker";

	import type { IMachineSpecs } from "@metalizzsas/nuster-typings";
    import type { IConfiguration } from "@metalizzsas/nuster-typings/build/configuration";
    import type { PageData } from './$types';

	export let data: PageData;
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let tempConfiguration: Partial<IConfiguration> = data.actualMachineConfigJson ?? {
        name: "",
        serial: "",
        model: undefined,
        variant: undefined,
        revision: undefined,

        addons: [],

        settings: {
            maskedManuals: [],
            maskedProfiles: [],
            maskedPremades: [],
            profilesMasked: true,
            ioControlsMasked: false,
            isPrototype: true
        }
    };
    
    let baseConfig: IMachineSpecs | undefined = undefined;
    $: baseConfig = data.machineModelsJson[`${tempConfiguration.model}/${tempConfiguration.variant}/${tempConfiguration.revision}`];

    const saveConfiguration = async () => {
        const request = await fetch(`//${$Linker}/config`, { method: 'POST', headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(tempConfiguration) 
        });

        if(request.status == 200)
        {
            window.location.href = "/";
        }
    };
</script>

<Navcontainer>

    <h1 class="text-2xl">Configuration machine.</h1>

    <p>Entrez les information de la machine.</p>

    <h2 class="text-xl my-2">Informations de base</h2>

    <Flex direction={"col"} gap={2} class="mb-2">

        <Flex direction="row" gap={4}>
            Nom de la machine
            <Inputkb bind:value={tempConfiguration.name} class="p-1.5 text-zinc-800"/>
        </Flex>

        <Flex direction="row" gap={4}>
            Numéro de série
            <Inputkb bind:value={tempConfiguration.serial} class="p-1.5 text-zinc-800"/>
        </Flex>

        <Flex direction={"row"} gap={4} items="center">
            <label for="machineModelSelector">Modèle de machine</label>
            <select bind:value={tempConfiguration.model} id="machineModelSelector" class="p-1.5 text-zinc-800">
                <option value={undefined} selected>—</option>
        
                {#each Array.from(new Set(Object.keys(data.machineModelsJson).map(k => k.split("/")[0]))) as machine}
                     <option value={machine}>{machine}</option>
                {/each}
            </select>
        </Flex>

        {#if tempConfiguration.model !== undefined}
            <Flex direction={"row"} gap={4}>
                <label for="machineVariantSelector">Variante de machine</label>
                <select bind:value={tempConfiguration.variant} id="machineVariantSelector" class="p-1.5 text-zinc-800">
                    <option value={undefined} selected>—</option>
        
                    {#each Array.from(new Set(Object.keys(data.machineModelsJson).filter(k => k.includes(tempConfiguration.model ?? "")).map(k => k.split("/")[1]))) as machine}
                        <option value={machine}>{machine}</option>
                    {/each}
                </select>
            </Flex> 
        {/if}

        {#if tempConfiguration.variant !== undefined && tempConfiguration.model !== undefined}
            <Flex direction={"row"} gap={4}>
                <label for="machineRevisionSelector">Révision de machine</label>
                <select bind:value={tempConfiguration.revision} id="machineRevisionSelector" class="p-1.5 text-zinc-800">
                    <option value={undefined} selected>—</option>
        
                    {#each Array.from(new Set(Object.keys(data.machineModelsJson).filter(k => k.includes(`${tempConfiguration.model ?? ''}/${tempConfiguration.variant ?? ''}`)).map(k => k.split("/")[2]))) as machine}
                        <option value={machine}>{machine}</option>
                    {/each}
                </select>
            </Flex>
        {/if}
    </Flex>

    {#if baseConfig !== undefined}
        <h2 class="text-xl">Informations complémentaires</h2>

        <h3 class="text-md">Réglages</h3>
        <ul>
            <li><input type="checkbox" bind:checked={tempConfiguration.settings.isPrototype} class="mr-3"/>Machine prototype <i>(Active le bouton etape suivante en cycle)</i></li>
            <li><input type="checkbox" bind:checked={tempConfiguration.settings.ioControlsMasked} class="mr-3"/>Bouton Controle I/O individuels</li>
            <li><input type="checkbox" bind:checked={tempConfiguration.settings.profilesMasked} class="mr-3"/>Bouton profils masqués.</li>
        </ul>

        <Flex direction={"col"} gap={2} class="mb-2">
            {#if baseConfig.addons !== undefined}
                 <Flex direction="col" gap={2}>
                    <h3 class="text-md">Addons</h3>
                    <ul>
                        {#each baseConfig.addons.map(a => a.addonName) as addon}
                            <li><input type="checkbox" bind:group={tempConfiguration.addons} value={addon} class="mr-3"/>{addon}</li>
                        {/each}
                    </ul>
                 </Flex>
            {/if}
        </Flex>
        <Flex direction={"col"} gap={2} class="mb-2">
            {#if baseConfig.profilePremades.length > 0}
                 <Flex direction="col" gap={2}>
                    <h3 class="text-md">Profils masqués</h3>
                    <ul>
                        {#each baseConfig.profilePremades.map(p => p.name) as profile}
                            <li><input type="checkbox" bind:group={tempConfiguration.settings.maskedProfiles} value={profile} class="mr-3"/>{profile}</li>
                        {/each}
                    </ul>
                 </Flex>
            {/if}
        
        </Flex>
        <Flex direction={"col"} gap={2} class="mb-2">
            {#if baseConfig.cyclePremades.length > 0}
                 <Flex direction="col" gap={2}>
                    <h3 class="text-md">Cycle préparés masqués</h3>
                    <ul>
                        {#each baseConfig.cyclePremades.map(p => p.name) as premade}
                            <li><input type="checkbox" bind:group={tempConfiguration.settings.maskedPremades} value={premade} class="mr-3"/>{premade}</li>
                        {/each}
                    </ul>
                 </Flex>
            {/if}
        </Flex>

        <Flex direction={"col"} gap={2} class="mb-2">
            {#if baseConfig.manual.length > 0}
                 <Flex direction="col" gap={2}>
                    <h3 class="text-md">Mode manuels masqués</h3>
                    <ul>
                        {#each baseConfig.manual.map(p => p.name) as manual}
                            <li><input type="checkbox" bind:group={tempConfiguration.settings.maskedManuals} value={manual} class="mr-3"/>{manual}</li>
                        {/each}
                    </ul>
                 </Flex>
            {/if}
        </Flex>

        <Flex direction={"col"} items={"center"}>
            <Button color="bg-emerald-500" size="large" on:click={saveConfiguration}>Sauvegarder</Button>
        </Flex>
    {/if}
</Navcontainer>