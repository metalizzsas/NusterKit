<script context="module" lang="ts">
	export async function load(ctx) {
		let data = await fetch('http://localhost/v1/profiles');

		return { props: { profiles: await data.json() } };
	}
</script>

<script lang="ts">
	import '$lib/app.css';
	import HeaderBack from '$lib/components/HeaderBack.svelte';

	import type { Profile2 } from '$lib/utils/interfaces';

	export var profiles: Profile2[];

	console.log(profiles);
</script>

<main>
	<HeaderBack title="Liste des profils">
		<button
			class="bg-green-600 text-white py-1 px-2 rounded-full flex flex-row gap-2 items-center"
		>
			<svg
				id="glyphicons-basic"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 32 32"
				class="fill-white h-5 w-5"
			>
				<path
					id="plus"
					d="M27,14v4a1,1,0,0,1-1,1H19v7a1,1,0,0,1-1,1H14a1,1,0,0,1-1-1V19H6a1,1,0,0,1-1-1V14a1,1,0,0,1,1-1h7V6a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v7h7A1,1,0,0,1,27,14Z"
				/>
			</svg>
			Ajouter Un profil
		</button>
	</HeaderBack>

	<div id="profileListWrapper" class="flex flex-col flex-nowrap justify-between gap-4">
		{#each profiles as profile}
			<div class="grid grid-cols-12 gap-4">
				<a href="profiles/{profile.id}" class="col-span-10">
					<div
						class="bg-black text-white py-2 px-4 rounded-full flex flex-row justify-between"
					>
						<div class="flex flex-col">
							<span class="text-md font-semibold">{profile.name}</span>
							<span class="text-xs text-gray-300 italic">
								Date de modification: {new Date(
									profile.modificationDate,
								).toLocaleString()}
							</span>
						</div>
						<div class="self-center">
							<svg
								id="glyphicons-basic"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 32 32"
								class="fill-white h-5 w-5"
							>
								<path
									id="chevron-right"
									d="M23.32849,16.70709,13.12115,26.91425a.50007.50007,0,0,1-.70715,0l-2.82806-2.8285a.5.5,0,0,1,0-.70709L16.96436,16,9.58594,8.62134a.5.5,0,0,1,0-.70709L12.414,5.08575a.50007.50007,0,0,1,.70715,0L23.32849,15.29291A.99988.99988,0,0,1,23.32849,16.70709Z"
								/>
							</svg>
						</div>
					</div>
				</a>
				<!-- Profile Buttons -->
				<div class="flex flex-row justify-around gap-4 col-span-2">
					<button class="self-center bg-red-500 text-white p-2 rounded-full">
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
					<button class="self-center bg-orange-500 text-white p-2 rounded-full">
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
		{/each}
	</div>
</main>
