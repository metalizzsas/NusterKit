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
	import type { PageData } from "./$types";
	import { settings } from "$lib/utils/stores/settings";
	import Label from "$lib/components/Label.svelte";
	import ProgressBar from "$lib/components/ProgressBar.svelte";
	import Grid from "$lib/components/layout/grid.svelte";
	import { realtime } from "$lib/utils/stores/nuster";

    export let data: PageData;

    const langs: { [x: string]: string } = {
		en: 'English',
		fr: 'Français',
		it: 'Italiano'
	};

    const update = async () => {
        const request = await fetch("/api/forceUpdate");

        if(request.ok && request.status == 200)
            isUpdating = true;
    };

    const reboot = () => {
        void fetch("/api/reboot");
    }

    const shutdown = () => {
        void fetch("/api/shutdown");
    }

    let isUpdating = false;
    let password = "";

</script>

<Wrapper>
    <Flex direction="col" gap={2}>
    
        <h1>{$_('settings.lead')}</h1>
    
        <h2>{$_('settings.ui.lead')}</h2>
        
        <SettingField label={$_('settings.ui.language')}>
            <Select bind:value={$settings.lang} selectableValues={Object.keys(langs).map(k => { return { name: langs[k], value: k}})}>
                {#each $locales as locale}
                    <option value={locale}>{langs[locale]}</option>
                {/each}
            </Select>
        </SettingField>

        <SettingField label={$_('settings.ui.dark_mode')}><Toggle bind:value={$settings.dark} /></SettingField>

        <h2>{$_('settings.machine.lead')}</h2>

        <SettingField label={$_('settings.machine.model')} value={$_(`settings.machines.${data.machine.model}`)} />
        <SettingField label={$_('settings.machine.variant')} value={data.machine.variant.toLocaleUpperCase()} />
        <SettingField label={$_('settings.machine.revision')} value={`${data.machine.revision}`} />
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
        
        <SettingField label={$_('settings.software.nuster')} value={data.version} />
        
        {#if data.machine.hypervisorData?.appState !== 'applied' && data.machine.hypervisorData?.overallDownloadProgress === null}
            <SettingField label={$_('settings.software.update')}>
                {#if isUpdating}
                    {$_('settings.software.update_installing')}
                    <ProgressBar progress={-1} />
                {:else}
                    <Button color={"hover:bg-indigo-500"} ringColor={"ring-indigo-500"} on:click={update} disabled={$realtime.cycle !== undefined}>{$_('settings.software.update_install')}</Button>
                {/if}
            </SettingField>
        {/if}
                
        <h2>{$_('settings.network.lead')}</h2>

        {#if data.machine.deviceData}
            <SettingField label={$_('settings.network.ip')} value={
                data.machine.deviceData.ip_address
                .split(' ')
                .filter((k) => k !== '192.168.1.2' && k !== '192.168.42.1')
            } />

            <SettingField label={$_('settings.network.mac')} value={
                data.machine.deviceData.mac_address
                .split(' ')
                .filter((mac_adr) => { return !['E4:5F:01', 'DC:A6:32', '3A:35:41', 'D8:3A:DD', 'B8:27:EB', '28:CD:C1'].map(mask => mac_adr.startsWith(mask)).reduce((p, c) => p || c) })
            } />
        {/if}

        <SettingField label={$_('settings.network.vpn')} value={
            data.machine.vpnData?.vpn.connected === undefined
            ? $_("false")
            : $_(String(data.machine.vpnData?.vpn.connected))
        } />

        <h2 class="mt-8">{$_('settings.power.lead')}</h2>

        <Grid cols={2} gap={8}>
            <Button color="hover:bg-amber-500" ringColor="ring-amber-500" on:click={reboot} disabled={$realtime.cycle !== undefined}>
                <Icon src={ArrowPath} class="h-4 w-4 inline mr-2 mb-1" />
                {$_('settings.power.reboot')}
            </Button>
            <Button color="hover:bg-red-500" ringColor="ring-red-500" on:click={shutdown} disabled={$realtime.cycle !== undefined}>
                <Icon src={Power} class="h-4 w-4 inline mr-2 mb-1" />
                {$_('settings.power.shutdown')}
            </Button>
        </Grid>

        <h2 class="mt-8">{$_('settings.advanced.lead')}</h2>
        
        <p class="text-orange-500">
            <Icon src={ExclamationTriangle} class="h-5 w-5 inline" />
            {$_('settings.advanced.sub')}
        </p>

        <Flex items="end">
            <Flex direction="col" gap={0.5} class="grow">
                <p class="text-sm text-zinc-600 dark:text-zinc-300 leading-6">{$_('settings.advanced.password')}</p>
                <PasswordField bind:value={password} class="grow"/>
            </Flex>
    
            <a href={password === "NusterMetalizz" ? "/settings/edit" : "#"}>
                <Button 
                    color={password === "NusterMetalizz" ?  "hover:bg-amber-500" : "hover:bg-zinc-500"} 
                    ringColor={password === "NusterMetalizz" ? "ring-amber-500" : "ring-zinc-500"}
                    disabled={$realtime.cycle !== undefined}
                >
                    {$_('settings.advanced.edit')}
                </Button>
            </a>
        </Flex>
    </Flex>
</Wrapper>
