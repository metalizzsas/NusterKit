<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async (ctx) => {
		let profileID = ctx.params.id;

		const content = await ctx.fetch(
			`http://${ctx.session.ip || '127.0.0.1'}/v1/profiles/${profileID}`,
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
	import { page } from '$app/stores';
	import { Linker } from '$lib/utils/linker';

	let saveModalShown = false;

	let initialProfile: string;

	export let profile: Profile;

	onMount(() => {
		initialProfile = JSON.stringify(profile);
		console.log($page.stuff);
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

<div class="rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-200 dark:bg-neutral-800 shadow-xl group">
	<div class="flex flex-row gap-5 justify-items-end -translate-y-4">
		<div
			class="rounded-xl bg-red-400 text-white py-1 px-3 font-semibold flex flex-row gap-2 items-center"
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
			class="rounded-xl bg-indigo-500 text-white py-1 px-8 font-semibold shadow-md group-hover:scale-105 transition-all"
		>
			{profile.name}
		</div>
	</div>
	<div id="profile-content" class="mt-3 flex flex-col gap-10">
		<div>
			<span class="rounded-xl bg-slate-500 px-5 py-2 text-white font-semibold">
				{$_('profile.globals')}
			</span>
			<div class="flex flex-row gap-4 mt-5">
				<ul>
					<li
						class="p-3 ring-1 ring-gray-900/10 bg-neutral-100 hover:ring-gray-900/50 transition rounded-xl flex flex-row gap-4 items-center text-gray-600/100"
					>
						<span class="font-medium">{$_('profile.name')}</span>
						<input
							type="text"
							class="jsvk border-0 bg-neutral-100"
							bind:value={profile.name}
							data-kioskboard-type="all"
							data-kioskboard-specialcharacters="true"
						/>
					</li>
				</ul>
			</div>
		</div>

		<div>
			<span class="rounded-xl bg-slate-500 px-5 py-2 text-white font-semibold">
				{$_('profile.settings')}
			</span>
			<div class="flex flex-col gap-5 mt-5 mb-3">
				{#each profile.fieldGroups as fg, index}
					<div class="flex flex-row gap-4">
						<div class="ml-4">
							<div
								id="catheader"
								class="flex flex-row justify-items-end items-center gap-4"
							>
								<span
									class="rounded ring-1 ring-slate-600/50 shadow-xl p-0.5 h-5 w-5 bg-white text-center text-xs text-gray-500"
								>
									{index}
								</span>
								<span
									class="rounded-xl bg-blue-400/50 px-5 py-2 text-white font-semibold"
								>
									{$_('profile.categories.' + fg.name)}
								</span>
								{#if fg.fields.filter((f) => f.name === 'enabled').length > 0}
									{#each fg.fields.filter((f) => f.name === 'enabled') as f}
										<Toggle
											bind:value={f.value}
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
							<div class="flex flex-col gap-5 mt-3 ml-16">
								{#each fg.fields.filter((f) => f.name !== 'enabled') as f}
									<div
										class="flex flex-row items-center gap-2 rounded-xl ring-1 ring-gray-500/10 py-2 px-2 bg-gray-500/75 mb-0.5"
									>
										<span class="text-white mr-4">
											{$_('profile.rows.' + f.name)}
										</span>
										{#if f.type === 'bool'}
											<Toggle bind:value={f.value} />
										{:else if f.type === 'float'}
											<input
												type="range"
												bind:value={f.value}
												min={f.floatMin}
												max={f.floatMax}
												step={f.floatStep}
											/>
										{:else if f.type === 'int'}
											{#if f.unity === 'm-s'}
												<TimeSelector bind:value={f.value} />
											{:else}
												<input
													type="number"
													class="jsvk w-25 bg-white px-2 py-1 rounded-full"
													min="0"
													max="59"
													bind:value={f.value}
													data-kioskboard-type="numpad"
													data-kioskboard-specialcharacters="false"
												/>
											{/if}
										{:else}
											<span class="text-red">Type {f.type} unsupported</span>
										{/if}

										{#if f.unity && f.unity != 'm-s'}
											<span
												class="bg-white text-black py-0.5 px-2 rounded-full"
											>
												{f.value}
												{f.unity}
											</span>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
