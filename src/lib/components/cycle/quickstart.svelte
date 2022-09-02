<script lang="ts">
	import { Linker } from '$lib/utils/stores/linker';
	import { machineData } from '$lib/utils/stores/store';
	import type { Profile } from '$lib/utils/interfaces';

	import { _ } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	import { goto } from '$app/navigation';

	import Navcontainer from '$lib/components/navigation/navcontainer.svelte';
	import Navcontainersubtitle from '$lib/components/navigation/navcontainersubtitle.svelte';
	import Navcontainertitle from '$lib/components/navigation/navcontainertitle.svelte';

	import ProfileRow from '$lib/components/profile/profileRow.svelte';

	import Modal from '../modals/modal.svelte';
	import Modalprompt from '../modals/modalprompt.svelte';

	let profiles: Array<Profile> = [];
	let selectedProfile: string = 'default';

	let saveProfileModalShown = false;
	let saveProfileNameInvalid = false;
	let deleteProfileModalShown = false;

	$: profile = profiles.find((k) => k.id == selectedProfile);
	$: if ($machineData.cycle !== undefined) goto('/app/cycle');
	$: if (saveProfileNameInvalid == true) {
		setTimeout(() => (saveProfileNameInvalid = false), 5000);
	}

	const loadProfiles = async () => {
		const reqProfiles = await fetch('//' + $Linker + '/api/v1/profiles/');

		if (reqProfiles.status == 200) {
			profiles = (await reqProfiles.json()) as Profile[];
		}

		const reqSkeleton = await fetch('//' + $Linker + '/api/v1/profiles/skeletons/default');

		if (reqSkeleton.status == 200) {
			const json = await reqSkeleton.json();

			const result = json as Profile;

			result.id = 'skeleton';
			result.name = '—';
			result.isPremade = false;
			result.overwriteable = true;

			profiles.push(result);

			profiles = profiles;

			selectedProfile = 'skeleton';
		}
	};

	const saveProfile = async (name?: string) => {
		if (profile !== undefined) {
			const newp = profile.id == 'skeleton';

			if (name) profile.name = name;

			if (newp) profile.id = 'created';

			await fetch('//' + $Linker + '/api/v1/profiles' + (newp ? '/create' : ''), {
				method: newp ? 'PUT' : 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(profile),
			});
			await loadProfiles();
		}
	};

	const deleteProfile = async () => {
		if (profile !== undefined) {
			await fetch('//' + $Linker + '/api/v1/profiles/' + profile.id, {
				method: 'DELETE',
			});

			await loadProfiles();
		}
	};

	const quickStart = async () => {
		if (profile !== undefined) {
			const QSProfile = profile.id == 'skeleton';

			if (QSProfile) profile.name = 'Quickstart';

			const url = '//' + $Linker + '/api/v1/cycle/default/' + (QSProfile ? '' : profile.id);
			const body = QSProfile ? JSON.stringify(profile) : '';

			const startRequest = await fetch(url, {
				method: 'POST',
				body: body,
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (startRequest.ok) {
				goto('/app/cycle');
			}
		}
	};

	onMount(async () => {
		await loadProfiles();
	});
</script>

{#if profile !== undefined}
	<Modalprompt
		bind:shown={saveProfileModalShown}
		title={$_('profile.modals.save.title').replace(
			'{profile.name}',
			profile.isPremade ? $_('cycle.types.' + profile.name) : profile.name,
		)}
		placeholder={profile.isPremade ? $_('cycle.types.' + profile.name) : profile.name}
		buttons={[
			{
				text: $_('ok'),
				color: 'bg-emerald-500',
				callback: (val) => {
					if (val != '') {
						saveProfileNameInvalid = false;
						saveProfile(val);
					} else {
						saveProfileNameInvalid = true;
						return false;
					}
				},
			},
			{
				text: $_('cancel'),
				color: 'bg-gray-500',
				callback: () => {},
			},
		]}
	>
		{$_('profile.modals.copy.message').replace(
			'{profile.name}',
			profile.isPremade ? $_('cycle.types.' + profile.name) : profile.name,
		)}
		{#if saveProfileNameInvalid}
			<p class="text-red-500 font-semibold" in:fly out:fly>
				{$_('profile.modals.save.name-short')}
			</p>
		{/if}
	</Modalprompt>

	<Modal
		bind:shown={deleteProfileModalShown}
		title={$_('profile.modals.delete.title').replace(
			'{profile.name}',
			profile.isPremade ? $_('cycle.types.' + profile.name) : profile.name,
		)}
		buttons={[
			{
				text: $_('yes'),
				color: 'bg-red-400',
				callback: deleteProfile,
			},
			{
				text: $_('no'),
				color: 'bg-gray-400',
				callback: () => {},
			},
		]}
	>
		{$_('profile.modals.delete.message').replace(
			'{profile.name}',
			profile.isPremade ? $_('cycle.types.' + profile.name) : profile.name,
		)}
	</Modal>
{/if}

<Navcontainer class="mb-auto">
	<Navcontainertitle>{$_('cycle.quickstart.head')}</Navcontainertitle>
	<div class="flex flex-col gap-6">
		{#if profile !== undefined}
			<div>
				<Navcontainersubtitle>
					{$_('cycle.quickstart.settings-save')}
				</Navcontainersubtitle>

				<div class="flex flex-row flex-nowrap gap-3">
					<select
						id="favorite"
						class="col-span-4 p-1.5 font-semibold rounded-full px-3 grow text-zinc-900"
						bind:value={selectedProfile}
					>
						{#each profiles.sort((a, b) => (a.name < b.name ? 1 : -1)) as profile}
							<option value={profile.id}>
								{profile.isPremade
									? $_('cycle.types.' + profile.name)
									: profile.name}
							</option>
						{/each}
					</select>
					{#if profile.overwriteable}
						<button
							class="self-center bg-emerald-500 text-white p-2 rounded-full"
							on:click|stopPropagation={() => {
								if (profile && profile.id == 'skeleton') {
									saveProfileModalShown = true;
								} else {
									saveProfile();
								}
							}}
						>
							<svg
								id="glyphicons-basic"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 32 32"
								class="fill-white w-5 h-5"
							>
								<path
									id="save"
									d="M28,23v4a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V23a1,1,0,0,1,1-1H27A1,1,0,0,1,28,23ZM15.18628,19.36078a1,1,0,0,0,1.62744,0l5.55682-7.77954A1,1,0,0,0,21.55682,10H19V4a1,1,0,0,0-1-1H14a1,1,0,0,0-1,1v6H10.44318a1,1,0,0,0-.81372,1.58124Z"
								/>
							</svg>
						</button>
					{/if}
					{#if profile.removable}
						<button
							class="self-center bg-red-500 text-white p-2 rounded-full"
							on:click|stopPropagation={() => {
								deleteProfileModalShown = true;
							}}
						>
							<svg
								id="glyphicons-basic"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 32 32"
								class="fill-white w-5 h-5"
							>
								<path
									id="bin"
									d="M7,26a2.00006,2.00006,0,0,0,2,2H23a2.00006,2.00006,0,0,0,2-2V10H7ZM20,14a1,1,0,0,1,2,0V24a1,1,0,0,1-2,0Zm-5,0a1,1,0,0,1,2,0V24a1,1,0,0,1-2,0Zm-5,0a1,1,0,0,1,2,0V24a1,1,0,0,1-2,0ZM26,6V8H6V6A1,1,0,0,1,7,5h6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1V5h6A1,1,0,0,1,26,6Z"
								/>
							</svg>
						</button>
					{/if}
				</div>
			</div>
			<div>
				<Navcontainersubtitle>{$_('cycle.quickstart.settings')}</Navcontainersubtitle>

				<div class="flex flex-col gap-2">
					{#each profile.fieldGroups.flatMap((fg) => fg.fields) as f}
						<ProfileRow bind:row={f} {profile} />
					{/each}
				</div>
			</div>
		{/if}

		<button
			class="bg-indigo-500 py-2 px-3 rounded-xl text-white font-semibold hover:scale-[1.01]"
			on:click={quickStart}
		>
			{$_('cycle.quickstart.start')}
		</button>
	</div>
</Navcontainer>
