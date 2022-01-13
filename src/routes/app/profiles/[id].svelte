<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async (ctx) => {
		let profileID = ctx.params.id;

		const content = await ctx.fetch(`http://127.0.0.1/v1/profiles/${profileID}`);

		let profile: Profile = await content.json();

		return { props: { profile } };
	};
</script>

<script lang="ts">
	import '$lib/app.css';
	import HeaderBack from '$lib/components/HeaderBack.svelte';
	import Modal from '$lib/components/modals/modal.svelte';
	import TimeSelector from '$lib/components/TimeSelector.svelte';
	import Toggle from '$lib/components/toggle.svelte';
	import type { Profile } from '$lib/utils/interfaces';

	let saveModalShown = false;

	export let profile: Profile;

	async function save() {
		await fetch('http://127.0.0.1/v1/profiles', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(profile),
		});
		//after saving return back to profile list
		window.history.back();
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
				window.history.back();
			},
		},
		{
			text: 'Annuler',
			color: 'bg-gray-400',
			callback: () => {},
		},
	]}
/>

<main>
	<!-- TODO: Add exit save && checkf or permission ton edit this content -->
	<HeaderBack
		bind:title={profile.name}
		call={() => (saveModalShown = true)}
		preventDefault={true}
	/>

	<span class="bg-gradient-to-r from-zinc-700 to-zinc-800 py-2 px-3 rounded-full mb-3 text-white">
		Informations globales
	</span>

	<div id="headWrapper" class="mt-4 mb-8">
		<div class="inline-block rounded-full py-2 px-2 bg-black items-center">
			<span class="text-white mr-4">Nom du profil</span>
			<input
				type="text"
				bind:value={profile.name}
				class="border-0 py-1 px-2 rounded-full bg-white text-black"
			/>
		</div>
	</div>

	<span class="bg-gradient-to-r from-zinc-700 to-zinc-800 py-2 px-3 rounded-full mb-3 text-white">
		Paramètres
	</span>

	<div id="fieldsGroupsWrapper" class="mt-4 mb-8">
		{#each profile.fieldGroups as fg}
			<div class="ml-4 mb-6">
				<div class="flex flex-row gap-4">
					<span
						class="bg-gradient-to-r from-stone-700 to-stone-800 py-1 px-2 rounded-full text-white"
					>
						{fg.name}
					</span>
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
				</div>

				<div id="fieldsWrapper{fg.name}" class="disabled my-2 ml-4 flex flex-col gap-2">
					{#each fg.fields.filter((f) => f.name !== 'enabled') as f}
						<div
							class="flex flex-row items-center gap-2 rounded-full py-2 px-2 bg-black"
						>
							<span class="text-white mr-4">{f.name}</span>
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
										class="w-25 bg-white px-2 py-1 rounded-full"
										min="0"
										max="59"
										bind:value={f.value}
									/>
								{/if}
							{:else}
								<span class="text-red">Type {f.type} unsupported</span>
							{/if}

							{#if f.unity && f.unity != 'm-s'}
								<span class="bg-white text-black py-0.5 px-2 rounded-full">
									{f.value}
									{f.unity}
								</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</main>
