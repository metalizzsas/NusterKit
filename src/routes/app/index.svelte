<script lang="ts">
	import '$lib/app.css';
	import SlotProduct from '$lib/components/SlotProduct.svelte';
	import { machineData } from '$lib/utils/store';
</script>

<div class="rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-200 dark:bg-neutral-800 shadow-xl group">
	<div class="flex flex-row justify-items-end -translate-y-4">
		<div
			class="rounded-xl bg-indigo-500 text-white py-1 px-8 font-semibold shadow-md group-hover:scale-105 transition-all"
		>
			Procédures
		</div>
	</div>

	<div class="grid grid-cols-3 gap-4">
		<a
			href="app/cycles"
			class="shadow-xl bg-gradient-to-br from-indigo-500 to-purple-500 py-3 px-5 text-white  font-semibold rounded-xl text-center transition-all hover:skew-y-1 duration-200 ease-in-out"
		>
			Cycles
		</a>
		<a
			href="app/profiles"
			class="shadow-xl bg-gradient-to-br from-indigo-500 to-purple-500 py-3 px-5 text-white  font-semibold rounded-xl text-center transition-all hover:-skew-y-1 duration-200 ease-in-out"
		>
			Profiles
		</a>
		<a
			href="app/advanced"
			class="shadow-xl bg-gradient-to-br from-indigo-500 to-purple-500 py-3 px-5 text-white  font-semibold rounded-xl text-center transition-all hover:skew-y-1 duration-200 ease-in-out"
		>
			Mode manuel
		</a>
	</div>
</div>

<div class="rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-200 dark:bg-neutral-800 shadow-xl group">
	<div class="flex flex-row justify-items-end -translate-y-4">
		<div
			class="rounded-xl bg-purple-500 text-white py-1 px-8 font-semibold shadow-md group-hover:scale-105 transition-all"
		>
			Slots
		</div>
	</div>

	<div class="grid grid-cols-2 gap-4">
		{#each $machineData.slots as slot}
			<SlotProduct bind:slotContent={slot} />
		{/each}
	</div>
</div>

<div class="rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-200 dark:bg-neutral-800 shadow-xl group">
	<div class="flex flex-row justify-items-end -translate-y-4">
		<div
			class="rounded-xl bg-cyan-500 text-white py-1 px-8 font-semibold shadow-md group-hover:scale-105 transition-all"
		>
			Maintenances
		</div>
	</div>

	<div class="flex flex-col gap-4">
		{#each $machineData.maintenances.filter((m) => m.name !== 'cycleCount') as m}
			<span>{m.name}</span>
		{/each}
	</div>
</div>
