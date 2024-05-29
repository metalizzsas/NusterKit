<script lang="ts">

    import Button from "$lib/components/buttons/Button.svelte";
	import Flex from "$lib/components/layout/flex.svelte";
	import Select from "$lib/components/inputs/Select.svelte";
	import Toggle from "$lib/components/inputs/Toggle.svelte";
	import Wrapper from "$lib/components/Wrapper.svelte";
	import SettingField from "./SettingField.svelte";
	import PasswordField from "$lib/components/inputs/PasswordField.svelte";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { ArrowPath, ExclamationTriangle, Power } from "@steeze-ui/heroicons";
    
	import { locales, _ } from "svelte-i18n";
	import type { ActionData, PageData } from "./$types";
	import Label from "$lib/components/Label.svelte";
	import ProgressBar from "$lib/components/ProgressBar.svelte";
	import Grid from "$lib/components/layout/grid.svelte";
	import { realtime } from "$lib/utils/stores/nuster";
	import { enhance } from "$app/forms";

    import { version } from "$app/environment";
	import Modal from "$lib/components/Modal.svelte";
	import SvelteMarkdown from "svelte-markdown";

    export let data: PageData;
    export let form: ActionData;

    const langs: { [x: string]: string } = {
		en: 'English',
		fr: 'Français',
		it: 'Italiano'
	};

    let showChangelog = false;

</script>

{#if showChangelog}
    <Modal title="Changelog" on:close={() => showChangelog = false}>
        <SvelteMarkdown source={data.changelog} />
    </Modal>
{/if}

{#if form?.advancedLogin?.error !== undefined}
    <Modal title="Error" on:close={() => form = null}>
        <p class="text-red-500 font-semibold">{form.advancedLogin.error}</p>
    </Modal>
{/if}

<Wrapper>
    <Flex direction="col" gap={2}>
    
        <h1>{$_('settings.lead')}</h1>
        <h2>{$_('settings.ui.lead')}</h2>
        
        <SettingField label={$_('settings.ui.language')}>
            <form action="?/updateSettings" method="post" id="settings" use:enhance>
                <Select bind:value={data.settings.lang} selectableValues={Object.keys(langs).map(k => { return { name: langs[k], value: k}})} form={{ name: "lang", validateOn: "change" }}>
                    {#each $locales as locale}
                        <option value={locale}>{langs[locale]}</option>
                    {/each}
                </Select>
            </form>
        </SettingField>

        <SettingField label={$_('settings.ui.dark_mode')}>
            <Toggle bind:value={data.settings.dark} form={{ formName: "settings", name: "dark", validateOn: "change" }} />
        </SettingField>

        <h2>{$_('settings.machine.lead')}</h2>

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

        <h2>{$_('settings.software.lead')}</h2>
        
        <SettingField label={$_('settings.software.ui_version')} value={version} />
        <SettingField label={$_('settings.software.turbine_version')} value={data.machine.turbineVersion} />
        <SettingField label={$_('settings.software.machine_specs_version')}>
            <Button size="small" color="hover:bg-indigo-500" ringColor="ring-indigo-500" on:click={() => showChangelog = true}>{$_('settings.software.show_changelog')}</Button>
        </SettingField>
        
        {#if data.machine.hypervisorData?.appState !== 'applied' && data.machine.hypervisorData?.overallDownloadProgress === null}
            <SettingField label={$_('settings.software.update')}>
                {#if form?.update !== undefined && "success" in form.update}
                    {$_('settings.software.update_installing')}
                    <ProgressBar progress={-1} />
                {:else}
                    <form action="?/update" method="post">
                        <Button color={"hover:bg-indigo-500"} ringColor={"ring-indigo-500"} size="small" disabled={$realtime.cycle !== undefined}>{$_('settings.software.update_install')}</Button>
                    </form>
                {/if}
            </SettingField>
        {/if}
                
        <h2>{$_('settings.network.lead')}</h2>

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

        <h2 class="mt-8">{$_('settings.power.lead')}</h2>

        <Grid cols={2} gap={4}>
            <form action="?/reboot" method="post">
                <Button class="w-full" color="hover:bg-amber-500" ringColor="ring-amber-500" disabled={$realtime.cycle !== undefined}>
                    <Icon src={ArrowPath} class="h-4 w-4 inline mr-2 mb-1" />
                    {$_('settings.power.reboot')}
                </Button>
            </form>

            <form action="?/shutdown" method="post">
                <Button class="w-full" color="hover:bg-red-500" ringColor="ring-red-500" disabled={$realtime.cycle !== undefined}>
                    <Icon src={Power} class="h-4 w-4 inline mr-2 mb-1" />
                    {$_('settings.power.shutdown')}
                </Button>
            </form>
        </Grid>

        <h2 class="mt-8">{$_('settings.advanced.lead')}</h2>
        
        <p class="text-orange-500">
            <Icon src={ExclamationTriangle} class="h-5 w-5 inline" />
            {$_('settings.advanced.sub')}
        </p>

        <form action="?/advancedLogin" method="post" use:enhance class="flex flex-row items-end gap-4">
            <PasswordField placeholder={$_('password')} value="" class="grow" name="password" />

            <Button 
                color={"hover:bg-amber-500"} 
                ringColor={"ring-amber-500"}
                disabled={$realtime.cycle !== undefined}
            >
                {$_('settings.advanced.edit')}
            </Button>
        </form>
    </Flex>
</Wrapper>
