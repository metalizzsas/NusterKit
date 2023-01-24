<script lang="ts">

    import type { PageData } from "./$types";
    import MachineRow from "./MachineRow.svelte";
    export let data: PageData;

</script>

<h2 class="text-3xl">Liste des machines</h2>
<p>Cette liste présente toutes les machines de votre organisation.</p>

<table class="table-auto w-full bg-zinc-800/50 p-4 rounded-md mt-8 ring-1 ring-indigo-500/50 overflow-clip">

    <thead class="font-semibold bg-zinc-800 text-lg border-b-2 border-b-indigo-500/50">
        <tr>
            <td class="p-4">Nom de la machine</td>
            <td>Type</td>
            <td>Prete pour production ?</td>
            <td>Cycle</td>
            <td>Ouvrir dans nuster</td>
        </tr>
    </thead>

    <tbody>
        {#each data.devices as device}
            <MachineRow bind:device />
        {/each}
    </tbody>
</table>