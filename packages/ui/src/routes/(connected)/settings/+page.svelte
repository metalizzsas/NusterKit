<script lang="ts">

    import Button from "$lib/components/buttons/Button.svelte";
	import Flex from "$lib/components/layout/flex.svelte";
	import Select from "$lib/components/inputs/Select.svelte";
	import Toggle from "$lib/components/inputs/Toggle.svelte";
	import Wrapper from "$lib/components/Wrapper.svelte";
	import PageHeader from "$lib/components/PageHeader.svelte";
	import SettingField from "./SettingField.svelte";
	import PasswordField from "$lib/components/inputs/PasswordField.svelte";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { ArrowPath, ExclamationTriangle, Power } from "@steeze-ui/heroicons";

	import { locales, _ } from "svelte-i18n";
	import type { ActionData, PageData } from "./$types";
	import Label from "$lib/components/Label.svelte";
	import ProgressBar from "$lib/components/ProgressBar.svelte";
	import Grid from "$lib/components/layout/grid.svelte";
	import { realtime, realtimeConnected } from "$lib/utils/stores/nuster";
	import { enhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";

    import { version } from "$app/environment";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import SvelteMarkdown from "@humanspeak/svelte-markdown";
	import { untrack } from "svelte";

    let { data, form }: { data: PageData; form: ActionData } = $props();

    const langs: { [x: string]: string } = {
		en: 'English',
		fr: 'Français',
		it: 'Italiano',
		de: 'Deutsch'
	};

    let settings = $state(untrack(() => ({ lang: data.settings.lang, dark: data.settings.dark })));
    let showChangelog = $state(false);

    type MachineAction = "update" | "reboot" | "shutdown";

    /** Action en attente de confirmation, et action en cours d'exécution. */
    let pending: MachineAction | undefined = $state(undefined);
    let running: MachineAction | undefined = $state(undefined);

    /** Titre et message de la modale, selon l'action demandée. */
    let confirm_title = $derived(pending === "update" ? "settings.software.confirm.title" : `settings.power.confirm.${pending}.title`);
    let confirm_message = $derived(pending === "update" ? "settings.software.confirm.message" : `settings.power.confirm.${pending}.message`);

    /**
     * L'avancement du téléchargement vient du superviseur balena, qui n'est lu
     * qu'au chargement de la page — il n'est pas diffusé par le WebSocket. On
     * rafraîchit donc tant qu'une installation est en cours, sinon la barre
     * resterait figée sur la valeur du premier rendu.
     */
    $effect(() => {
        if (running !== "update") return;

        const interval = setInterval(() => invalidateAll(), 3000);
        return () => clearInterval(interval);
    });

    let download_progress = $derived(data.machine.hypervisorData?.overallDownloadProgress ?? null);
</script>

<Dialog.Root open={pending !== undefined} onOpenChange={(open) => { if (!open) pending = undefined; }}>
    <Dialog.Content class="max-w-md">
        <Dialog.Header>
            <Dialog.Title>{$_(confirm_title)}</Dialog.Title>
            <Dialog.Description>{$_(confirm_message)}</Dialog.Description>
        </Dialog.Header>

        <Dialog.Footer>
            <Button color="hover:bg-zinc-500" ringColor="ring-zinc-500" onclick={() => pending = undefined}>
                {$_('cancel')}
            </Button>

            <!-- Le formulaire vit dans la modale : son action suit l'opération
                 demandée, et rien n'est envoyé tant qu'on n'a pas confirmé. -->
            <form
                method="post"
                action={`?/${pending}`}
                use:enhance={() => {
                    running = pending;
                    pending = undefined;
                    return async ({ update }) => { await update({ reset: false }); };
                }}
            >
                <Button
                    color={pending === "shutdown" ? "hover:bg-red-500" : "hover:bg-amber-500"}
                    ringColor={pending === "shutdown" ? "ring-red-500" : "ring-amber-500"}
                >
                    {$_('proceed')}
                </Button>
            </form>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={showChangelog}>
    <Dialog.Content class="max-h-[80vh] max-w-2xl overflow-y-auto">
        <Dialog.Header>
            <Dialog.Title>Changelog</Dialog.Title>
        </Dialog.Header>
        <div class="markdown">
            <SvelteMarkdown source={data.changelog} />
        </div>
    </Dialog.Content>
</Dialog.Root>

<Dialog.Root
    open={!!(form && "advancedLogin" in form)}
    onOpenChange={(open) => { if (!open) form = null; }}
>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Error</Dialog.Title>
        </Dialog.Header>
        {#if form && "advancedLogin" in form}
            <p class="font-semibold text-red-500">{form.advancedLogin.error}</p>
        {/if}
    </Dialog.Content>
</Dialog.Root>

<PageHeader title={$_('settings.lead')} />

<div class="grid gap-4 md:grid-cols-2">

    <Wrapper>
        <Flex direction="col" gap={2}>
            <h2 class="mb-1">{$_('settings.ui.lead')}</h2>

            <SettingField label={$_('settings.ui.language')}>
                <form action="?/updateSettings" method="post" id="settings" use:enhance>
                    <Select bind:value={settings.lang} selectableValues={Object.keys(langs).map(k => { return { name: langs[k], value: k}})} form={{ name: "lang", validateOn: "change" }} />
                </form>
            </SettingField>

            <SettingField label={$_('settings.ui.dark_mode')}>
                <Toggle bind:value={settings.dark} form={{ formName: "settings", name: "dark", validateOn: "change" }} />
            </SettingField>
        </Flex>
    </Wrapper>

    <Wrapper>
        <Flex direction="col" gap={2}>
            <h2 class="mb-1">{$_('settings.machine.lead')}</h2>

            <SettingField label={$_('settings.machine.model')} value={$_(`machineModelName`)} />
            <SettingField label={$_('settings.machine.serial')} value={data.machine.serial.toLocaleUpperCase()} />

            {#if data.machine.addons !== undefined && data.machine.addons.length > 0}
                <SettingField label={$_('settings.machine.addons')}>
                    <Flex gap={2} items="center">
                        {#each data.machine.addons as addon}
                            <Label>{$_(`addons.${addon}`)}</Label>
                        {/each}
                    </Flex>
                </SettingField>
            {/if}

            {#if data.cycleCount !== undefined } <SettingField label={$_('settings.machine.cycle_count')} value={`${data.cycleCount.duration}`} /> {/if}
        </Flex>
    </Wrapper>

    <Wrapper>
        <Flex direction="col" gap={2}>
            <h2 class="mb-1">{$_('settings.software.lead')}</h2>

            <SettingField label={$_('settings.software.ui_version')} value={version} />
            <SettingField label={$_('settings.software.turbine_version')} value={data.machine.turbineVersion} />
            <SettingField label={$_('settings.software.machine_specs_version')}>
                <Button size="small" color="hover:bg-indigo-500" ringColor="ring-indigo-500" onclick={() => showChangelog = true}>{$_('settings.software.show_changelog')}</Button>
            </SettingField>

            {#if data.machine.hypervisorData?.appState !== 'applied' && data.machine.hypervisorData?.overallDownloadProgress === null}
                <SettingField label={$_('settings.software.update')}>
                    <Button
                        color="hover:bg-indigo-500"
                        ringColor="ring-indigo-500"
                        size="small"
                        disabled={$realtime.cycle !== undefined || running !== undefined}
                        onclick={() => pending = "update"}
                    >
                        {$_('settings.software.update_install')}
                    </Button>
                </SettingField>
            {/if}
        </Flex>
    </Wrapper>

    <Wrapper>
        <Flex direction="col" gap={2}>
            <h2 class="mb-1">{$_('settings.network.lead')}</h2>

            <SettingField label={$_('settings.network.vpn')} value={
                data.machine.vpnData?.vpn.connected === undefined
                ? $_("false")
                : $_(String(data.machine.vpnData?.vpn.connected))
            } />

            <SettingField label={$_('settings.network.wireless_connected')} value={
                $realtime.network.devices.find(k => k.iface === "wlan0")?.address !== undefined ? $_("true") : $_("false")
            } />

            <SettingField label={$_('settings.network.wired_connected')} value={
                $realtime.network.devices.find(k => k.iface === "enp1s0u1")?.address !== undefined ? $_("true") : $_("false")
            } />

            <SettingField label={$_('settings.network.edit')}>
                <a href="/settings/network">
                    <Button color="hover:bg-indigo-500" ringColor="ring-indigo-500" size="small">
                        {$_('settings.network.edit_button')}
                    </Button>
                </a>
            </SettingField>
        </Flex>
    </Wrapper>

    <Wrapper>
        <Flex direction="col" gap={3}>
            <h2>{$_('settings.power.lead')}</h2>

            <Flex direction="col" gap={2}>
                <Button class="w-full" color="hover:bg-indigo-500" ringColor="ring-indigo-500" onclick={() => window.location.reload()}>
                    <Icon src={ArrowPath} class="mr-2 h-4 w-4" />
                    {$_('settings.power.reload')}
                </Button>

                <Button
                    class="w-full"
                    color="hover:bg-amber-500"
                    ringColor="ring-amber-500"
                    disabled={$realtime.cycle !== undefined || running !== undefined}
                    onclick={() => pending = "reboot"}
                >
                    <Icon src={ArrowPath} class="mr-2 h-4 w-4" />
                    {$_('settings.power.reboot')}
                </Button>

                <Button
                    class="w-full"
                    color="hover:bg-red-500"
                    ringColor="ring-red-500"
                    disabled={$realtime.cycle !== undefined || running !== undefined}
                    onclick={() => pending = "shutdown"}
                >
                    <Icon src={Power} class="mr-2 h-4 w-4" />
                    {$_('settings.power.shutdown')}
                </Button>
            </Flex>

            <!-- Suivi de l'opération en cours. Sans lui, l'écran ne renvoyait
                 rien après un clic : sur une machine qui met une minute à
                 redémarrer, l'opérateur ne pouvait pas savoir si sa demande
                 avait été prise en compte. -->
            {#if running !== undefined}
                <Wrapper variant="muted" padding="p-4">
                    <Flex direction="col" gap={2}>
                        <h3 class="leading-6">
                            {$_(running === "update" ? 'settings.software.update_installing' : `settings.power.modal.${running}.title`)}
                        </h3>

                        <p class="text-sm text-zinc-600 dark:text-zinc-400">
                            {$_(running === "update" ? 'settings.software.update_progress' : `settings.power.modal.${running}.message`)}
                        </p>

                        <ProgressBar progress={running === "update" ? download_progress : null} showProgressLabel={running === "update" && download_progress !== null} />

                        <p class="flex items-center gap-1.5 text-sm" class:text-emerald-600={$realtimeConnected} class:text-amber-600={!$realtimeConnected}>
                            <span class="h-2 w-2 rounded-full" class:bg-emerald-500={$realtimeConnected} class:bg-amber-500={!$realtimeConnected}></span>
                            {$_(`settings.power.modal.connection_${$realtimeConnected ? 'live' : 'lost'}`)}
                        </p>
                    </Flex>
                </Wrapper>
            {/if}
        </Flex>
    </Wrapper>

    <Wrapper>
        <Flex direction="col" gap={3}>
            <h2>{$_('settings.advanced.lead')}</h2>

            <p class="text-sm text-amber-600 dark:text-amber-400">
                <Icon src={ExclamationTriangle} class="mb-0.5 inline h-4 w-4" />
                {$_('settings.advanced.sub')}
            </p>

            <form action="?/advancedLogin" method="post" use:enhance class="flex flex-col gap-3">
                <PasswordField placeholder={$_('password')} value="" class="w-full" name="password" />

                <Button
                    class="self-end"
                    color={"hover:bg-amber-500"}
                    ringColor={"ring-amber-500"}
                    disabled={$realtime.cycle !== undefined}
                >
                    {$_('settings.advanced.edit')}
                </Button>
            </form>
        </Flex>
    </Wrapper>

</div>
