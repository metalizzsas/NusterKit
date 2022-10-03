<script lang="ts">
	import Modal from '$lib/components/modals/modal.svelte';
	import ModalPrompt from '$lib/components/modals/modalprompt.svelte';
	import { _, date, time } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { Linker } from '$lib/utils/stores/linker';
	import type { IProfileHydrated } from '@metalizzsas/nuster-typings/src/hydrated/profile';

	export let profile: IProfileHydrated;
	export let delCb: Function;

	let copyProfileModalShown = false;
	let deleteProfileModalShown = false;

	function copyProfile(newName: string) {
		let newProfile = profile;

		newProfile.id = 'copied';
		newProfile.name = newName;

		fetch('//' + $Linker + '/api/v1/profiles/', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(newProfile),
		}).then((returnData) => {
			returnData.json().then((result: IProfileHydrated) => {
				goto('/app/profiles/' + result.id);
			});
		});
	}

	async function deleteProfile(profile: IProfileHydrated) {
		await fetch('//' + $Linker + '/api/v1/profiles/' + profile.id, {
			method: 'DELETE',
		});
		delCb();
	}
</script>

<ModalPrompt
	bind:shown={copyProfileModalShown}
	title={$_('profile.modals.copy.title').replace(
		'{profile.name}',
		profile.isPremade ? $_('cycle.types.' + profile.name) : profile.name,
	)}
	placeholder={profile.isPremade ? $_('cycle.types.' + profile.name) : profile.name}
	buttons={[
		{
			text: $_('ok'),
			color: 'bg-emerald-500',
			callback: copyProfile,
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
</ModalPrompt>

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
			callback: () => deleteProfile(profile),
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

<div
	class="bg-zinc-700 text-white py-2 px-4 rounded-2xl flex flex-row justify-between cursor-pointer"
	on:click={() => goto('profiles/' + profile.id)}
>
	<div class="flex flex-col">
		<span class="text-md font-semibold">
			{profile.isPremade === true ? $_('cycle.types.' + profile.name) : profile.name}
		</span>
		<span class="text-xs text-gray-300 italic">
			{$_('profile.modification-date')}: {$date(new Date(profile.modificationDate), {
				format: 'medium',
			})}
			{$time(new Date(profile.modificationDate), {
				format: 'short',
			})}
		</span>
	</div>
	<div class="flex flex-row gap-4 self-center">
		{#if profile.removable == true}
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

		<button
			class="self-center bg-orange-500 text-white p-2 rounded-full"
			on:click|stopPropagation={() => {
				copyProfileModalShown = true;
			}}
		>
			<svg
				id="glyphicons-basic"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 32 32"
				class="fill-white w-5 h-5"
			>
				<path
					id="clipboard"
					d="M22,18.5v1a.5.5,0,0,1-.5.5h-11a.5.5,0,0,1-.5-.5v-1a.5.5,0,0,1,.5-.5h11A.5.5,0,0,1,22,18.5ZM21.5,22h-11a.5.5,0,0,0-.5.5v1a.5.5,0,0,0,.5.5h11a.5.5,0,0,0,.5-.5v-1A.5.5,0,0,0,21.5,22Zm0-8h-11a.5.5,0,0,0-.5.5v1a.5.5,0,0,0,.5.5h11a.5.5,0,0,0,.5-.5v-1A.5.5,0,0,0,21.5,14ZM26,10V26a2.00229,2.00229,0,0,1-2,2H8a2.00229,2.00229,0,0,1-2-2V10A2.00229,2.00229,0,0,1,8,8h2V7a1,1,0,0,1,1-1h2a2.00006,2.00006,0,0,1,2-2h2a2.00006,2.00006,0,0,1,2,2h2a1,1,0,0,1,1,1V8h2A2.00229,2.00229,0,0,1,26,10ZM24.001,26,24,10H22v1a1,1,0,0,1-1,1H11a1,1,0,0,1-1-1V10H8V26Z"
				/>
			</svg>
		</button>
	</div>
</div>
