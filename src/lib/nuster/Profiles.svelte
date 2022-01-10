<script lang="ts">
	import Back from '$lib/components/Back.svelte';

	import { machineData } from '$lib/utils/store';
</script>

<header class="mb-5">
	<div class="flex flex-row justify-items-end gap-4 items-center">
		<Back />

		<h1 class="text-2xl">Liste des profils</h1>
	</div>
</header>

<main>
	<div id="profileListWrapper" class="flex flex-col flex-nowrap justify-between gap-2">
		{#each $machineData.profiles as profile, index}
			<span class="bg-black px-5 py-1 rounded-full text-white">{profile.name}</span>
		{/each}
	</div>
</main>
