<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async (ctx) => {
		const content = await ctx.fetch(
			`//${window.localStorage.getItem('ip') ?? '127.0.0.1'}/api/v1/profiles/${
				ctx.params.id
			}`,
		);

		let profile: Profile = await content.json();

		return { props: { profile } };
	};
</script>

<script lang="ts">
	import '$lib/app.css';
	import Modal from '$lib/components/modals/modal.svelte';
	import TimeSelector from '$lib/components/timeselector.svelte';
	import Toggle from '$lib/components/toggle.svelte';
	import Inputkb from '$lib/components/inputkb.svelte';
	import type { Profile } from '$lib/utils/interfaces';
	import { onDestroy, onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { Linker } from '$lib/utils/linker';
	import { navActions, navBackFunction, navTitle } from '$lib/utils/navstack';
	import Navcontainertitle from '$lib/components/navigation/navcontainertitle.svelte';
	import Navcontainersubtitle from '$lib/components/navigation/navcontainersubtitle.svelte';

	export let profile: Profile;

	let saveModalShown = false;
	let saveModalCancel = false;
	let initialProfile: string;

	onMount(() => {
		initialProfile = JSON.stringify(profile);
	});

	async function save() {
		await fetch('//' + $Linker + '/api/v1/profiles', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(profile),
		});
		//after saving return back to profile list
		goto('/app/profiles');
	}

	const exit = async () => {
		return new Promise<void>((resolve) => {
			if (initialProfile !== JSON.stringify(profile)) {
				saveModalShown = true;
				const timer = setInterval(() => {
					if (saveModalShown == false) {
						resolve();
						clearInterval(timer);
						if (saveModalCancel == true) saveModalCancel = false;
						else goto('/app/profiles');
					}
				}, 100);
			} else {
				goto('/app/profiles');
			}
		});
	};

	onDestroy(() => {
		$navBackFunction = null;
		$navActions = null;
	});

	$: $navTitle = [
		$_('profile.list'),
		profile.isPremade ? $_('cycle.types.' + profile.name) : profile.name,
	];
	$navActions = [];
	$navBackFunction = exit;
</script>

<Modal
	bind:shown={saveModalShown}
	title={$_('profile.modals.save.title').replace(
		'{profile.name}',
		profile.isPremade ? $_('cycle.types.' + profile.name) : profile.name,
	)}
	buttons={[
		{
			text: $_('yes'),
			color: 'bg-emerald-500',
			callback: async () => {
				await save();
			},
		},
		{
			text: $_('no'),
			color: 'bg-red-500',
			callback: () => {},
		},
		{
			text: $_('cancel'),
			color: 'bg-gray-500',
			callback: () => {
				saveModalCancel = true;
			},
		},
	]}
>
	{$_('profile.modals.save.message').replace(
		'{profile.name}',
		profile.isPremade ? $_('cycle.types.' + profile.name) : profile.name,
	)}
</Modal>

<Navcontainertitle>{$_('profile.globals')}</Navcontainertitle>

<div class="bg-zinc-700 rounded-xl py-1 px-3 flex flex-row justify-between items-center mb-5">
	<span class="text-white">{$_('profile.name')}</span>
	<Inputkb
		bind:value={profile.name}
		options={{ class: 'border-0 bg-neutral-100 dark:bg-zinc-600 font-semibold p-2 m-1 -mr-1' }}
		disabled={!profile.overwriteable}
	/>
</div>

<Navcontainertitle>{$_('profile.settings')}</Navcontainertitle>

<div class="flex flex-col gap-2">
	{#each profile.fieldGroups as fg, index}
		<div class="flex flex-row gap-3 items-center align-middle mb-1 mt-4 first:mt-1">
			<Navcontainersubtitle underline={false} margin={false}>
				{$_('profile.categories.' + fg.name)}
			</Navcontainersubtitle>
			{#each fg.fields.filter((f) => f.name === 'enabled') as f}
				<Toggle
					bind:value={f.value}
					locked={!profile.overwriteable}
					enableGrayScale={!profile.overwriteable}
					on:change={(e) => {
						let d = fg.fields.find((f) => f.name === 'enabled');
						if (d) {
							d.value = e.detail.value;
						}
					}}
				/>
			{/each}
		</div>

		{#each fg.fields.filter((z) => z.name !== 'enabled') as f}
			<div
				class="bg-zinc-700 rounded-l-xl rounded-r-3xl py-1 px-2 flex flex-row justify-between items-center"
			>
				<span class="text-white">
					{$_('profile.rows.' + f.name)}
				</span>

				<div class="-mr-1 flex flex-row gap-3">
					{#if f.type === 'bool'}
						<Toggle
							bind:value={f.value}
							locked={!profile.overwriteable}
							enableGrayScale={!profile.overwriteable}
						/>
					{:else if f.type === 'float'}
						<input
							type="range"
							class="w-[20vw] bg-white dark:bg-zinc-600 accent-indigo-500"
							bind:value={f.value}
							min={f.floatMin}
							max={f.floatMax}
							step={f.floatStep}
							disabled={!profile.overwriteable}
						/>
					{:else if f.type === 'int'}
						{#if f.unity === 'm-s'}
							<div class="text-md">
								<TimeSelector
									bind:value={f.value}
									disabled={!profile.overwriteable}
								/>
							</div>
						{:else}
							<Inputkb
								bind:value={f.value}
								disabled={!profile.overwriteable}
								options={{
									class: 'w-25 bg-white dark:bg-zinc-600 px-3 py-1 rounded-full font-semibold',
								}}
							/>
						{/if}
					{:else}
						<span class="text-red">Type {f.type} unsupported</span>
					{/if}

					{#if f.unity && f.unity != 'm-s'}
						<span
							class="bg-white text-zinc-800 py-0.5 text-center rounded-full block w-16"
						>
							{f.value}
							<span class="font-semibold">{f.unity}</span>
						</span>
					{/if}
				</div>
			</div>
		{/each}
	{/each}
</div>
