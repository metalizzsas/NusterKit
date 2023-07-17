<script lang="ts">

    import { _ } from "svelte-i18n";
	import type { PageData } from "./$types";
	import { goto } from "$app/navigation";

	import Flex from "$lib/components/layout/flex.svelte";

	import { translateProfileName } from "$lib/utils/i18n/i18nprofile";

    import type { ProfileHydrated } from "@metalizzsas/nuster-typings/build/hydrated";
	import Wrapper from "$lib/components/Wrapper.svelte";
	import ProfileField from "./ProfileField.svelte";
	import Button from "$lib/components/buttons/Button.svelte";
	import TextField from "$lib/components/inputs/TextField.svelte";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { XMark } from "@steeze-ui/heroicons";
	import { machine } from "$lib/utils/stores/nuster";

    export let data: PageData;

    let profileSaved = false;
    let deleteConfirm = false;

    const saveProfile = async () => {

        if(data.profile._id === undefined)
            return;

        const req = await fetch(`/api/v1/profiles/${data.profile._id}`, { method: 'PATCH', headers: { "content-type": "application/json" }, body: JSON.stringify(data.profile) });
        if(req.ok && req.status === 200)
            profileSaved = true;
    };

    const copyProfile = async () => {
        const copy: ProfileHydrated = {...data.profile, _id: "copied", name: `${translateProfileName($_, data.profile)} — ${$_('profile.copy.suffix')}`};

        const req = await fetch(`/api/v1/profiles/`, { method: 'post', headers: { "content-type": "application/json" }, body: JSON.stringify(copy) });

        if(req.ok && req.status === 200)
        {
            const profileCopied = (await req.json() as ProfileHydrated);
            if(profileCopied._id)
                void goto(`/profiles/${profileCopied._id}`);
        }
    };

    const deleteProfile = async () => {

        if(deleteConfirm === false)
        {
            deleteConfirm = true;
            return;
        }

        if(data.profile._id)
        {
            const req = await fetch(`/api/v1/profiles/${data.profile._id}`, { method: 'delete'});
            if(req.ok && req.status === 200)
                void goto("/profiles");
        }
    }

    /// - Reactive statements

    $: if(profileSaved === true) { setTimeout(() => profileSaved = false, 3000)}
    $: if(deleteConfirm === true) { setTimeout(() => deleteConfirm = false, 10000)}

</script>

<Wrapper>
    <Flex direction="col" gap={2}>
        <Flex justify="between">
            <div>
                {#if profileSaved}<p class="text-sm text-emerald-700 font-medium duration-300">{$_('profile.save.message')}</p>{/if}
                <h1>{translateProfileName($_, data.profile)}</h1>
            </div>
            <Flex items="start">
                <Button on:click={() => void goto("/profiles")} size="small" color="hover:bg-gray-500" ringColor="ring-gray-500">{$_('exit')}</Button>
                {#if data.profile.isPremade !== true}
                    <Button on:click={deleteProfile} size="small" color="hover:bg-red-500" ringColor="ring-red-500">
                        {#if deleteConfirm}
                            <Icon src={XMark} class="h-5 w-5 mr-1 mb-0.5 inline" />
                            {$_('profile.delete.button_confirm')}
                        {:else}
                            {$_('profile.delete.button')}
                        {/if}
                    </Button>
                {/if}
                <Button on:click={copyProfile} size="small" color="hover:bg-amber-500" ringColor="ring-amber-500">{$_('profile.copy.button')}</Button>
                {#if data.profile.isPremade !== true}
                    <Button on:click={saveProfile} size="small" color="hover:bg-emerald-500" ringColor="ring-emerald-500">{$_('profile.save.button')}</Button>
                {/if}
            </Flex>
        </Flex>
    
        {#if data.profile.isPremade !== true}
            <Flex direction="col" items="start" gap={0.5} class="my-2">
                <span class="text-sm text-zinc-600 dark:text-zinc-300">{$_('profile.name')}</span>
                <TextField bind:value={data.profile.name} class="w-1/3" />
            </Flex>
        {/if}
    
        {#each [...new Set(data.profile.values.map(k => k.name.split("#")[0]))] as category}
    
            {@const fields = data.profile.values.filter(k => { 
                const catReturn = k.name.split("#").at(0) == category;
                const shouldHideFields = $machine.settings.onlyShowSelectedProfileFields ?? false;
    
                if(shouldHideFields)
                    return catReturn && k.detailsShown
                else
                    return catReturn;
            })}
    
            {#if fields.length > 0}
                <section class="mb-4">
    
                    <h2 class="mb-2">{$_(`profile.categories.${category}`)}</h2>
    
                    <Flex direction="col" gap={3}>
                        {#each fields as field}
                            <ProfileField bind:field disabled={data.profile.isPremade === true} />
                        {/each}
                    </Flex>
                </section>
            {/if}
        {/each}
    </Flex>
</Wrapper>