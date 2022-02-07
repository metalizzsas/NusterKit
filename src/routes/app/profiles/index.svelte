<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async (ctx) => {
		let data = await ctx.fetch(`http://${ctx.session.ip || '127.0.0.1'}/v1/profiles`);

		return { props: { profiles: await data.json() } };
	};
</script>

<script lang="ts">
	import { goto } from '$app/navigation';

	import '$lib/app.css';
	import ModalPrompt from '$lib/components/modals/modalprompt.svelte';

	import Profile from '$lib/components/profile.svelte';
	import type { Profile as ProfileModel } from '$lib/utils/interfaces';
	import { _ } from 'svelte-i18n';
	import { Linker } from '$lib/utils/linker';

	let addProfileModalShown = false;

	export var profiles: ProfileModel[];

	function reload() {
		setTimeout(async () => {
			profiles = await (await fetch('http://' + $Linker + '/v1/profiles')).json();
		}, 300);
	}

	async function listProfileBlueprint() {
		let response = await fetch('http://' + $Linker + '/v1/profiles/skeletons');
		let types = (await response.json()) as string[];

		if (types.length == 1) {
			createProfile(types[0]);
		} else {
			addProfileModalShown = true;
		}
	}

	async function createProfile(type: string) {
		let response = await fetch('http://' + $Linker + '/v1/profiles/create/' + type, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		let p = (await response.json()) as ProfileModel;

		goto(`profiles/${p.id}`);
	}
</script>

<main>
	<ModalPrompt
		bind:shown={addProfileModalShown}
		title={$_('profile.modals.create.title')}
		message={$_('profile.modals.create.message')}
		buttons={[
			{
				text: $_('ok'),
				color: 'bg-green-400',
				callback: (value) => {
					createProfile(value || 'default');
				},
			},
			{
				text: $_('cancel'),
				color: 'bg-gray-400',
				callback: () => {},
			},
		]}
	/>

	<div class="rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-300 dark:bg-neutral-800 shadow-xl group">
		<div class="flex flex-row gap-5 justify-items-end -translate-y-4">
			<div
				on:click={() => goto('/app')}
				class="rounded-full bg-red-400 text-white py-1 px-3 font-semibold flex flex-row gap-2 items-center cursor-pointer"
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
				class="rounded-full bg-indigo-500 text-white py-1 px-8 font-semibold shadow-md group-hover:scale-105 transition-all"
			>
				{$_('profile.list')}
			</div>
		</div>

		<div id="profilesContainer" class="flex flex-col gap-4">
			{#each profiles as profile}
				<Profile bind:profile delCb={reload} />
			{/each}
			<button
				class="bg-indigo-400 rounded-xl font-semibold py-2 px-5 text-white flex flex-row gap-4 justify-center items-center"
				on:click={listProfileBlueprint}
			>
				<svg
					id="glyphicons-basic"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 32 32"
					class="h-5 w-5 fill-white"
				>
					<path
						id="user-plus"
						d="M9.36481,13.37427A1.2749,1.2749,0,0,1,10,11.62988V9c0-3,2-5,5.5-5a6.79133,6.79133,0,0,1,2.64575.50122,7.94842,7.94842,0,0,0,3.59918,8.26123,1.71227,1.71227,0,0,1-.10974.61182l-.28.75146a2.99115,2.99115,0,0,1-1.31073,1.462l-.66583,3.05176A2.99994,2.99994,0,0,1,16.44763,21H14.55237a2.99994,2.99994,0,0,1-2.931-2.36047l-.66583-3.05176a2.99143,2.99143,0,0,1-1.31073-1.462ZM32,6a6,6,0,1,1-6-6A6,6,0,0,1,32,6Zm-3-.5a.5.5,0,0,0-.5-.5H27V3.5a.5.5,0,0,0-.5-.5h-1a.5.5,0,0,0-.5.5V5H23.5a.5.5,0,0,0-.5.5v1a.5.5,0,0,0,.5.5H25V8.5a.5.5,0,0,0,.5.5h1a.5.5,0,0,0,.5-.5V7h1.5a.5.5,0,0,0,.5-.5ZM26.06885,22.87207l-5.13623-2.7052A5.02336,5.02336,0,0,1,16.44727,23H14.55273a5.02379,5.02379,0,0,1-4.48553-2.833l-5.136,2.70508A1.57806,1.57806,0,0,0,4,24.23669V27a1,1,0,0,0,1,1H26a1,1,0,0,0,1-1V24.23669A1.57806,1.57806,0,0,0,26.06885,22.87207Z"
					/>
				</svg>

				{$_('profile.buttons.add')}
			</button>
		</div>
	</div>
</main>
