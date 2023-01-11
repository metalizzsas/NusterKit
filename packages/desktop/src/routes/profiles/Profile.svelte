<script lang="ts">

	import { _ } from "svelte-i18n";

	import Flex from "$lib/components/layout/flex.svelte";

	import { translateProfileName } from "$lib/utils/i18n/i18nprofile";

    import type { ProfileHydrated } from "@metalizzsas/nuster-typings/build/hydrated";
	import ProfileField from "./ProfileField.svelte";
	import Button from "$lib/components/buttons/Button.svelte";
	import { createEventDispatcher } from "svelte";
	import TextField from "$lib/components/inputs/TextField.svelte";
	import { page } from "$app/stores";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { XMark } from "@steeze-ui/heroicons";

    export let profile: ProfileHydrated;

    let profileSaved = false;
    let profileCopied: ProfileHydrated | undefined;

    let deleteConfirm = false;

    const dispatcher = createEventDispatcher<{exit: null}>();

    export let exit = () => dispatcher("exit");

    const saveProfile = async () => {
        const req = await fetch(`${$page.data.nuster_api_host}/api/v1/profiles/`, { method: 'post', headers: { "content-type": "application/json" }, body: JSON.stringify(profile) });
        if(req.ok && req.status === 200)
            profileSaved = true;
    };

    const copyProfile = async () => {
        const copy: ProfileHydrated = {...profile, _id: "copied", name: `${profile.name} — ${$_('profile.copy.label')}`};

        const req = await fetch(`${$page.data.nuster_api_host}/api/v1/profiles/`, { method: 'put', headers: { "content-type": "application/json" }, body: JSON.stringify(copy) });

        if(req.ok && req.status === 200)
            profileCopied = (await req.json() as ProfileHydrated);
    };

    const deleteProfile = async () => {

        if(deleteConfirm === false)
        {
            deleteConfirm = true;
            return;
        }

        const req = await fetch(`${$page.data.nuster_api_host}/api/v1/profiles/${profile._id}`, { method: 'delete'});

        if(req.ok && req.status === 200)
            exit();
    }

    /// - Reactive statements

    $: if(profileSaved === true) { setTimeout(() => profileSaved = false, 3000)}
    $: if(profileCopied !== undefined) { setTimeout(() => profileCopied = undefined, 3000)}
    $: if(deleteConfirm === true) { setTimeout(() => deleteConfirm = false, 10000)}

</script>

<Flex direction="col" gap={2}>
    <Flex justify="between">
        <div>
            {#if profileSaved}<p class="text-sm text-emerald-700 font-medium duration-300">{$_('profile.save.message')}</p>{/if}
            {#if profileCopied} <p class="text-sm text-amber-700 font-medium duration-300">{$_('profile.copy.message', { values: { name: profileCopied.name}})}</p>{/if}
            <h1>{translateProfileName($_, profile)}</h1>
        </div>
        <Flex items="start">
            <Button on:click={exit} size="small" color="hover:bg-gray-500" ringColor="ring-gray-500">{$_('exit')}</Button>
            {#if profile.isPremade !== true}
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
            {#if profile.isPremade !== true}
                <Button on:click={saveProfile} size="small" color="hover:bg-emerald-500" ringColor="ring-emerald-500">{$_('profile.save.button')}</Button>
            {/if}
        </Flex>
    </Flex>
    <Flex direction="col" items="start" gap={0.5} class="my-2">
        <span class="text-sm text-zinc-600 dark:text-zinc-300">{$_('profile.name')}</span>
        <TextField bind:value={profile.name} disabled={profile.isPremade === true}/>
    </Flex>

    <h3>{$_('profile.settings')}</h3>

    {#each [...new Set(profile.values.map(k => k.name.split("#")[0]))] as category}

        <section class="mb-2">

            <h4 class="mb-1">{$_(`profile.categories.${category}`)}</h4>

            <Flex direction="col" gap={1.5}>
                {#each profile.values.filter(k => k.name.split("#").at(0) == category) as field}
                    <ProfileField bind:field disabled={profile.isPremade === true} />
                {/each}
            </Flex>
        </section>
    {/each}
</Flex>