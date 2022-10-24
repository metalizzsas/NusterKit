<script lang="ts">
    import { _ } from "svelte-i18n";

	import type { IProfileHydrated } from "@metalizzsas/nuster-typings/build/hydrated/profile";

    import Navcontainersubtitle from "../navigation/navcontainersubtitle.svelte";
    import Toggle from "../userInputs/toggle.svelte";
    import ProfileRow from "./profileRow.svelte";

    export let profile: IProfileHydrated;
    export let category: string;

    $: fields = profile.values.filter(v => v.name.includes(category + "#") && !v.name.includes("enabled"));
    $: enabledCategoryField = profile.values.find(v => v.name == category + "#enabled");

</script>

<div class="flex flex-row gap-3 items-center align-middle mb-1 mt-4 first:mt-1">
    <Navcontainersubtitle>
        {$_('profile.categories.' + category)}
    </Navcontainersubtitle>

    {#if enabledCategoryField !== undefined}
        <Toggle
        bind:value={enabledCategoryField.value}
        locked={profile.isOverwritable === false}
        enableGrayScale={profile.isOverwritable === false}
        on:change={(e) => { if(enabledCategoryField) { enabledCategoryField.value = e.detail.value } }}
    />
    {/if}
</div>

{#each fields as field}
    <ProfileRow bind:row={field} bind:profile />
{/each}