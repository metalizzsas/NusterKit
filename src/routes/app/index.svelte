<script lang="ts">
	import { _ } from 'svelte-i18n';
	import '$lib/app.css';
	import Maintenance from '$lib/components/maintenance/maintenance.svelte';
	import SlotProduct from '$lib/components/slotproduct.svelte';
	import { machineData } from '$lib/utils/store';
	import { goto } from '$app/navigation';
	import Infoblock from '$lib/components/infoblock.svelte';
</script>

<main id="content">
	<div class="rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-300 dark:bg-neutral-800  group">
		<div class="flex flex-row justify-items-end -translate-y-4">
			<div
				class="rounded-xl bg-rose-500 text-white py-1 px-8 font-semibold  group-hover:scale-105 transition-all"
			>
				{$_('informations')}
			</div>
		</div>

		<div class="grid grid-cols-2 gap-4">
			{#each $machineData.machine._nuster.mainInformations as info}
				<Infoblock {info} />
			{/each}
		</div>
	</div>

	<div class="rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-300 dark:bg-neutral-800  group">
		<div class="flex flex-row justify-items-end -translate-y-4">
			<div
				class="rounded-xl bg-indigo-500 text-white py-1 px-8 font-semibold  group-hover:scale-105 transition-all"
			>
				{$_('procedures')}
			</div>
		</div>

		<div class="grid grid-cols-3 gap-4">
			<div
				on:click={() => goto('app/cycle')}
				class="flex flex-row items-center justify-center gap-4 bg-gradient-to-br from-indigo-500 to-indigo-600 py-3 px-5 text-white  font-semibold rounded-xl text-center transition-all hover:skew-y-[0.25deg] duration-200 ease-in-out"
			>
				{$_('cycle.button')}
				{#if $machineData.cycle !== undefined}
					<span class="grid grid-cols-1 h-3 w-3 items-center justify-items-center ">
						<span
							class="relative inline-flex rounded-full h-3 w-3 {$machineData.cycle
								.status.mode != 'ended'
								? 'bg-emerald-500'
								: 'bg-red-500'}"
							style="grid-area: 1/1/1/1;"
						/>
						<span
							class="animate-ping relative inline-flex h-3 w-3 rounded-full {$machineData
								.cycle.status.mode != 'ended'
								? 'bg-emerald-400'
								: 'bg-red-400'} opacity-75"
							style="grid-area: 1/1/1/1;"
						/>
					</span>

					<span
						class="rounded-full bg-white text-gray-700/75 py-1 px-2 font-semibold text-xs"
					>
						{$machineData.cycle.status.progress
							? Math.ceil($machineData.cycle.status.progress * 100)
							: '0'} %
					</span>
				{/if}
			</div>
			<div
				on:click={() => goto('app/profiles')}
				class=" bg-gradient-to-br from-indigo-500 to-indigo-600 py-3 px-5 text-white  font-semibold rounded-xl text-center transition-all hover:-skew-y-[0.25deg] duration-200 ease-in-out"
			>
				{$_('profile.button')}
			</div>
			<div
				on:click={() => goto('app/advanced')}
				class=" bg-gradient-to-br from-indigo-500 to-indigo-600 py-3 px-5 text-white  font-semibold rounded-xl text-center transition-all hover:skew-y-[0.25deg] duration-200 ease-in-out"
			>
				{$_('manual.button')}
			</div>
		</div>
	</div>

	<div class="rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-300 dark:bg-neutral-800  group">
		<div class="flex flex-row justify-items-end -translate-y-4">
			<div
				class="rounded-xl bg-purple-500 text-white py-1 px-8 font-semibold  group-hover:scale-105 transition-all"
			>
				{$_('slots.name')}
			</div>
		</div>

		<div class="grid grid-cols-2 gap-4">
			{#each $machineData.slots as slot}
				<SlotProduct bind:slotContent={slot} />
			{/each}
		</div>
	</div>

	<div class="rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-300 dark:bg-neutral-800  group">
		<div class="flex flex-row justify-items-end -translate-y-4">
			<div
				class="rounded-xl bg-cyan-500 text-white py-1 px-8 font-semibold  group-hover:scale-105 transition-all"
			>
				{$_('maintenance.list')}
			</div>
		</div>

		<div class="grid grid-cols-2 gap-4">
			{#each $machineData.maintenances.filter((m) => m.name !== 'cycleCount') as m}
				<Maintenance bind:maintenance={m} />
			{/each}
		</div>
	</div>
</main>
