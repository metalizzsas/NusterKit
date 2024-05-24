<script lang="ts">

    import { _ } from "svelte-i18n";
	import type { PageData } from "./$types";
	import { goto } from "$app/navigation";

	import Flex from "$lib/components/layout/flex.svelte";

	import { translateProfileName } from "$lib/utils/i18n/i18nprofile";

    import type { ProfileHydrated } from "@metalizzsas/nuster-turbine/types/hydrated";
	import Wrapper from "$lib/components/Wrapper.svelte";
	import ProfileField from "./ProfileField.svelte";
	import Button from "$lib/components/buttons/Button.svelte";
	import TextField from "$lib/components/inputs/TextField.svelte";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { XMark } from "@steeze-ui/heroicons";
	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import type { ActionData } from "../$types";

    export let data: PageData;
    export let form: ActionData;

    // TODO: Display a modal to validate the deletion
    let deleteConfirm = false;

    /// - Reactive statements

    $: if(form !== null && form?.saveProfile?.success) { setTimeout(() => form = null, 3000)}
    $: if(deleteConfirm === true) { setTimeout(() => deleteConfirm = false, 10000)}

</script>

<Wrapper>
    <Flex direction="col" gap={2}>
        <Flex justify="between">
            <div>
                {#if form !== null && form?.saveProfile?.success}<p class="text-sm text-emerald-700 font-medium duration-300">{$_('profile.save.message')}</p>{/if}
                <h1>{translateProfileName($_, data.profile)}</h1>
            </div>
            <Flex items="start">
                <Button on:click={() => void goto("/profiles")} size="small" color="hover:bg-gray-500" ringColor="ring-gray-500">{$_('exit')}</Button>
                {#if data.profile.isPremade !== true}
                    {#if deleteConfirm}
                        <form action="?/deleteProfile" method="post" use:enhance>
                            <input type="hidden" name="profile_id" value={data.profile.id} />
                            <Button size="small" color="hover:bg-red-500" ringColor="ring-red-500">
                                <Icon src={XMark} class="h-5 w-5 mr-1 mb-0.5 inline" />
                                {$_('profile.delete.button_confirm')}
                            </Button>
                        </form>
                    {:else}
                        <Button on:click={() => deleteConfirm = true} size="small" color="hover:bg-red-500" ringColor="ring-red-500">
                            {$_('profile.delete.button')}
                        </Button>
                    {/if}
                {/if}

                <form action="?/copyProfile" method="post" use:enhance>
                    <input type="hidden" name="profile_id" value={data.profile.id} />
                    <input type="hidden" name="profile" value={JSON.stringify({...data.profile, name: data.profile.name + " — " + $_('profile.copy.suffix') })} />
                    <Button size="small" color="hover:bg-amber-500" ringColor="ring-amber-500">{$_('profile.copy.button')}</Button>
                </form>
                
                {#if data.profile.isPremade !== true}
                    <form action="?/saveProfile" method="post" use:enhance>
                        <input type="hidden" name="profile_id" value={data.profile.id} />
                        <input type="hidden" name="profile" value={JSON.stringify(data.profile)} />
                        <Button size="small" color="hover:bg-emerald-500" ringColor="ring-emerald-500">{$_('profile.save.button')}</Button>
                    </form>
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
                const shouldHideFields = $page.data.machine_configuration.settings.onlyShowSelectedProfileFields ?? false;
    
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