<script lang="ts">

    import { _ } from "svelte-i18n";
	import type { PageData } from "./$types";
	import { goto } from "$app/navigation";

	import Flex from "$lib/components/layout/flex.svelte";

	import { translateProfileName } from "$lib/utils/i18n/i18nprofile";
	import { cn } from "$lib/utils/cn.js";
	import PageHeader from "$lib/components/PageHeader.svelte";
	import { Card, CardContent } from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ProfileField from "./ProfileField.svelte";
	import Button from "$lib/components/buttons/Button.svelte";
	import TextField from "$lib/components/inputs/TextField.svelte";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { XMark, ExclamationTriangle, Folder } from "@steeze-ui/heroicons";
	import * as Select from "$lib/components/ui/select/index.js";
	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import type { ActionData } from "../$types";
	import type { ProfileHydrated } from "$lib/api/types";

    let { data, form }: { data: PageData; form: ActionData } = $props();

    /* SvelteKit's `data` prop isn't a deep $state proxy, so nested mutations don't drive
       reactivity. Hold a local clone in $state and bind ProfileField to that. */
    let profile = $state<ProfileHydrated>(structuredClone(data.profile));
    let originalSnapshot = $state(JSON.stringify(profile));
    let isDirty = $derived(JSON.stringify(profile) !== originalSnapshot);

    let deleteConfirm = $state(false);
    let saveSubmit: HTMLButtonElement | undefined = $state();
    let pendingNavigate: string | undefined = $state();
    let showLeaveDialog = $state(false);

    /* ── Folder picker ─────────────────────────────────────────────── */
    let creatingFolder = $state(false);
    let newFolderName = $state("");

    /* Known folders + the profile's own (it may have just been created here). */
    let folderOptions = $derived(
        [...new Set([...data.folders, ...(profile.folder ? [profile.folder] : [])])].sort((a, b) => a.localeCompare(b)),
    );

    const onFolderChange = (value: string) => {
        if (value === "__new__") {
            newFolderName = "";
            creatingFolder = true;
            return;
        }
        profile.folder = value === "__none__" ? null : value;
    };

    const createFolder = () => {
        const name = newFolderName.trim();
        if (name.length === 0) return;
        profile.folder = name;
        creatingFolder = false;
    };

    /* Group fields by category prefix (everything before the first `#`). */
    let categories = $derived.by(() => {
        const seen = new Map<string, ProfileHydrated["values"]>();
        const hideHidden =
            $page.data.machine_configuration.settings.onlyShowSelectedProfileFields ?? false;

        for (const value of profile.values) {
            if (hideHidden && !value.detailsShown) continue;
            const cat = value.name.split("#")[0];
            if (!seen.has(cat)) seen.set(cat, []);
            seen.get(cat)!.push(value);
        }
        return [...seen.entries()];
    });

    let activeTab = $state<string | undefined>(undefined);

    /* Default the active tab to the first category once categories are computed,
       and reset it if the current tab disappears (e.g. visibility filter changes). */
    $effect(() => {
        if (categories.length === 0) {
            activeTab = undefined;
            return;
        }
        const exists = activeTab && categories.some(([c]) => c === activeTab);
        if (!exists) activeTab = categories[0][0];
    });

    $effect(() => {
        if (form?.saveProfile && "success" in form.saveProfile) {
            originalSnapshot = JSON.stringify(profile);
            const target = pendingNavigate;
            pendingNavigate = undefined;
            if (target) {
                void goto(target);
            }
        }
    });
    $effect(() => {
        if (deleteConfirm === true) { setTimeout(() => deleteConfirm = false, 10000) }
    });

    const onBack = () => {
        if (isDirty && profile.isPremade !== true) {
            showLeaveDialog = true;
            return;
        }
        void goto("/profiles");
    };

    const discardAndLeave = () => {
        showLeaveDialog = false;
        profile = structuredClone(data.profile);
        originalSnapshot = JSON.stringify(profile);
        void goto("/profiles");
    };

    const saveAndLeave = () => {
        showLeaveDialog = false;
        pendingNavigate = "/profiles";
        saveSubmit?.click();
    };
</script>

<PageHeader title={translateProfileName($_, profile)} {onBack}>
    {#snippet actions()}
        {#if profile.isPremade !== true}
            {#if isDirty}
                <span class="flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400">
                    <Icon src={ExclamationTriangle} theme="solid" class="h-4 w-4" />
                    {$_('profile.unsaved.indicator')}
                </span>
            {/if}

            {#if deleteConfirm}
                <form action="?/deleteProfile" method="post" use:enhance>
                    <input type="hidden" name="profile_id" value={profile.id} />
                    <Button size="small" color="hover:bg-red-500" ringColor="ring-red-500">
                        <Icon src={XMark} class="h-5 w-5 mr-1 mb-0.5 inline" />
                        {$_('profile.delete.button_confirm')}
                    </Button>
                </form>
            {:else}
                <Button onclick={() => deleteConfirm = true} size="small" color="hover:bg-red-500" ringColor="ring-red-500">
                    {$_('profile.delete.button')}
                </Button>
            {/if}
        {/if}

        <form action="?/copyProfile" method="post" use:enhance>
            <input type="hidden" name="profile_id" value={profile.id} />
            <input type="hidden" name="profile" value={JSON.stringify({...profile, name: $_('profile.premade.' + profile.name) + " — " + $_('profile.copy.suffix') })} />
            <Button size="small" color="hover:bg-amber-500" ringColor="ring-amber-500">{$_('profile.copy.button')}</Button>
        </form>
    {/snippet}
</PageHeader>

{#if profile.isPremade !== true}
    <!-- Hidden save form — submitted by the leave dialog's "save and leave". -->
    <form action="?/saveProfile" method="post" class="hidden" use:enhance>
        <input type="hidden" name="profile_id" value={profile.id} />
        <input type="hidden" name="profile" value={JSON.stringify(profile)} />
        <button type="submit" bind:this={saveSubmit} aria-hidden="true"></button>
    </form>
{/if}

{#if profile.isPremade !== true}
    <Card class="mb-4 flex-row items-center gap-4 px-4 py-3">
        <span class="shrink-0 text-sm font-medium text-muted-foreground">{$_('profile.name')}</span>
        <TextField bind:value={profile.name} class="grow" />

        <div class="h-7 w-px shrink-0 bg-border"></div>

        <Icon src={Folder} theme="solid" class="h-4 w-4 shrink-0 text-muted-foreground" />
        {#if creatingFolder}
            <TextField bind:value={newFolderName} placeholder={$_('profile.folder.name_placeholder')} class="w-44" />
            <Button onclick={createFolder} size="small" color="hover:bg-indigo-500" ringColor="ring-indigo-500">
                {$_('profile.folder.create')}
            </Button>
            <button
                type="button"
                onclick={() => (creatingFolder = false)}
                class="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-zinc-500 transition-colors hover:border-indigo-400 hover:text-indigo-500"
                aria-label={$_('profile.unsaved.cancel')}
            >
                <Icon src={XMark} theme="mini" class="h-4 w-4" />
            </button>
        {:else}
            <Select.Root type="single" value={profile.folder ?? "__none__"} onValueChange={onFolderChange}>
                <Select.Trigger class="h-10 w-48 shrink-0 border-border bg-white text-sm shadow-xs transition-colors hover:border-indigo-400 dark:bg-zinc-800">
                    <span data-slot="select-value" class="truncate">
                        {profile.folder ?? $_('profile.folder.none')}
                    </span>
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value="__none__" label={$_('profile.folder.none')} class="min-h-10 text-sm">
                        {$_('profile.folder.none')}
                    </Select.Item>
                    {#each folderOptions as folder (folder)}
                        <Select.Item value={folder} label={folder} class="min-h-10 text-sm">
                            {folder}
                        </Select.Item>
                    {/each}
                    <Select.Item value="__new__" label={$_('profile.folder.new')} class="min-h-10 text-sm font-medium text-indigo-600 dark:text-indigo-300">
                        + {$_('profile.folder.new')}
                    </Select.Item>
                </Select.Content>
            </Select.Root>
        {/if}
    </Card>
{/if}

{#if activeTab !== undefined}
    <Tabs.Root bind:value={activeTab} class="w-full min-w-0">
        <!-- Sticky segmented tab bar — swipe-scrollable on touch, no visible scrollbar. -->
        <div class="sticky top-0 z-10 mb-4 w-full max-w-full bg-zinc-50/95 py-1 backdrop-blur dark:bg-background/95">
            <div class="w-full overflow-x-auto overflow-y-hidden">
                <Tabs.List
                    class="inline-flex h-auto w-max justify-start gap-0.5 rounded-xl bg-zinc-200/70 p-1 dark:bg-zinc-800/80"
                >
                    {#each categories as [category, fields] (category)}
                        {@const active = activeTab === category}
                        <Tabs.Trigger
                            value={category}
                            class={cn(
                                "relative shrink-0 rounded-lg border-0 px-4 py-2 text-sm font-medium transition-colors after:hidden",
                                active
                                    ? "!bg-white !text-zinc-900 shadow-sm dark:!bg-zinc-600/90 dark:!text-white"
                                    : "!bg-transparent !text-zinc-500 hover:!text-zinc-800 dark:!text-zinc-400 dark:hover:!text-zinc-100",
                            )}
                        >
                            <span class="inline-flex items-center gap-2">
                                <span>{$_(`profile.categories.${category}`)}</span>
                                <span
                                    class={cn(
                                        "grid h-5 min-w-5 place-items-center rounded-md px-1 font-mono text-[10px] font-medium tabular-nums transition-colors",
                                        active
                                            ? "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-200"
                                            : "bg-zinc-300/60 text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-400",
                                    )}
                                >
                                    {fields.length}
                                </span>
                            </span>
                        </Tabs.Trigger>
                    {/each}
                </Tabs.List>
            </div>
        </div>

        {#each categories as [category, fields] (category)}
            <Tabs.Content value={category} class="mt-0 focus-visible:outline-none">
                <Card class="rounded-lg gap-0 py-0">
                    <CardContent class="flex flex-col gap-1 p-2">
                        {#each fields as field (field.name)}
                            {@const fieldIndex = profile.values.findIndex((v) => v.name === field.name)}
                            {@const fieldId = `field-${field.name.replace(/[^a-z0-9]/gi, "-")}`}
                            <div class="flex items-center justify-between gap-6 rounded-md px-4 py-3 transition-colors hover:bg-muted/40">
                                <Label for={fieldId} class="text-base font-normal text-foreground select-none">
                                    {$_(`profile.rows.${field.name.split("#")[1]}`)}
                                </Label>
                                <div class="flex shrink-0 justify-end" id={fieldId}>
                                    <ProfileField
                                        bind:field={profile.values[fieldIndex]}
                                        disabled={profile.isPremade === true}
                                        compact
                                    />
                                </div>
                            </div>
                        {/each}
                    </CardContent>
                </Card>
            </Tabs.Content>
        {/each}
    </Tabs.Root>
{/if}

<Dialog.Root bind:open={showLeaveDialog}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>{$_('profile.unsaved.title')}</Dialog.Title>
            <Dialog.Description>{$_('profile.unsaved.description')}</Dialog.Description>
        </Dialog.Header>
        <Flex gap={2} justify="end" class="mt-4 flex-wrap">
            <Button onclick={() => showLeaveDialog = false} size="small" color="hover:bg-gray-500" ringColor="ring-gray-500">
                {$_('profile.unsaved.cancel')}
            </Button>
            <Button onclick={discardAndLeave} size="small" color="hover:bg-red-500" ringColor="ring-red-500">
                {$_('profile.unsaved.discard')}
            </Button>
            <Button onclick={saveAndLeave} size="small" color="hover:bg-emerald-500" ringColor="ring-emerald-500">
                {$_('profile.unsaved.save_and_leave')}
            </Button>
        </Flex>
    </Dialog.Content>
</Dialog.Root>
