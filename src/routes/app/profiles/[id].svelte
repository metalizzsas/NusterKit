<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async (ctx) => {
		const content = await ctx.fetch(
			`http://${window.localStorage.getItem('ip') ?? '127.0.0.1'}/v1/profiles/${
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
	import type { Profile } from '$lib/utils/interfaces';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { Linker } from '$lib/utils/linker';
	import Inputkb from '$lib/components/inputkb.svelte';

	let saveModalShown = false;

	let initialProfile: string;

	export let profile: Profile;

	onMount(() => {
		initialProfile = JSON.stringify(profile);
	});
	async function save() {
		await fetch('http://' + $Linker + '/v1/profiles', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(profile),
		});
		//after saving return back to profile list
		goto('/app/profiles');
	}
</script>

<Modal
	bind:shown={saveModalShown}
	message={'Souhaitez vous sauvegarder le profil ?'}
	title={'Sauvegarder?'}
	buttons={[
		{
			text: 'Oui',
			color: 'bg-green-400',
			callback: () => {
				save();
			},
		},
		{
			text: 'Non',
			color: 'bg-red-400',
			callback: () => {
				goto('/app/profiles');
			},
		},
		{
			text: 'Annuler',
			color: 'bg-gray-400',
			callback: () => {},
		},
	]}
/>

<div class="rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-300 dark:bg-neutral-800 shadow-xl group">
	<div class="flex flex-row gap-5 justify-items-end -translate-y-4">
		<div
			class="rounded-full bg-red-400 text-white py-1 px-3 font-semibold flex flex-row gap-2 items-center cursor-pointer"
			on:click|preventDefault={() => {
				if (JSON.stringify(profile) !== initialProfile) saveModalShown = true;
				else goto('/app/profiles');
			}}
		>
			<svg
				id="glyphicons-basic"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 32 32"
				class="h-5 w-5 fill-white"
			>
				<path
					id="chevron-left"
					d="M22.41406,23.37866a.5.5,0,0,1,0,.70709L19.586,26.91425a.50007.50007,0,0,1-.70715,0L8.67151,16.70709a.99988.99988,0,0,1,0-1.41418L18.87885,5.08575a.50007.50007,0,0,1,.70715,0l2.82806,2.8285a.5.5,0,0,1,0,.70709L15.03564,16Z"
				/>
			</svg>
		</div>
		<div
			class="rounded-full bg-indigo-400 text-white py-1 px-8 font-semibold shadow-md group-hover:scale-105 transition-all"
		>
			{profile.name}
		</div>
	</div>

	<div class="flex flex-col gap-2">
		<div
			class="bg-zinc-700 rounded-xl py-1 px-3 flex flex-row justify-between items-center mb-5"
		>
			<span class="text-white">{$_('profile.name')}</span>
			<Inputkb
				bind:value={profile.name}
				options={{ class: 'border-0 bg-neutral-100 p-1 m-1 -mr-1' }}
				disabled={!profile.overwriteable}
			/>
		</div>

		{#each profile.fieldGroups as fg, index}
			<div class="flex flex-row gap-3 items-center my-2">
				<span class="rounded-full py-1 px-3 bg-indigo-400 font-semibold text-white">
					{$_('profile.categories.' + fg.name)}
				</span>

				{#if fg.fields.filter((f) => f.name === 'enabled').length > 0}
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
				{/if}
			</div>

			{#each fg.fields.filter((z) => z.name !== 'enabled') as f}
				<div
					class="bg-zinc-700 rounded-xl py-1 px-3 flex flex-row justify-between items-center"
				>
					<span class="text-white">
						{$_('profile.rows.' + f.name)}
					</span>

					<div class="-mr-2 flex flex-row gap-3">
						{#if f.type === 'bool'}
							<Toggle
								bind:value={f.value}
								locked={!profile.overwriteable}
								enableGrayScale={!profile.overwriteable}
							/>
						{:else if f.type === 'float'}
							<input
								type="range"
								class="w-[20vw]"
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
										class: 'w-25 bg-white px-2 py-1 rounded-full',
									}}
								/>
							{/if}
						{:else}
							<span class="text-red">Type {f.type} unsupported</span>
						{/if}

						{#if f.unity && f.unity != 'm-s'}
							<span
								class="bg-white text-black py-0.5 text-center rounded-full block w-16"
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
</div>
