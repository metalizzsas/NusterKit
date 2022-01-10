<script lang="ts">
	import Back from '$lib/components/Back.svelte';
	import { Link } from 'svelte-navigator';
	import { machineData } from '$lib/utils/store';
</script>

<header class="mb-5">
	<div class="flex flex-row justify-items-end gap-4 items-center">
		<Back />

		<h1 class="text-2xl">Liste des profils</h1>
	</div>
</header>

<main>
	<div id="profileListWrapper" class="flex flex-col flex-nowrap justify-between gap-4">
		{#each $machineData.profiles as profile, index}
			<div class="grid grid-cols-12 gap-4">
				<Link to="/profile/{profile.id}" class="col-span-11">
					<div
						class="bg-black text-white py-2 px-4 rounded-full flex flex-row justify-between"
					>
						<div class="flex flex-col">
							<span class="text-md font-semibold">{profile.name}</span>
							<span class="text-xs">{profile.modificationDate}</span>
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
				</Link>
				<button
					class="self-center bg-red-500 text-white p-2 rounded-full flex flex-row justify-around box-content"
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
			</div>
		{/each}
	</div>
</main>
