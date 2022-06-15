<script lang="ts">
	import { _ } from 'svelte-i18n';
	import '$lib/app.css';
	import Maintenance from '$lib/components/maintenance/maintenance.svelte';
	import SlotProduct from '$lib/components/slots/slotproduct.svelte';
	import { machineData } from '$lib/utils/store';
	import { goto } from '$app/navigation';
	import { useNavContainer } from '$lib/utils/navstack';
	import { onDestroy } from 'svelte';

	$useNavContainer = false;

	onDestroy(() => ($useNavContainer = true));
</script>

<div class="rounded-xl p-3 mt-6 bg-neutral-300 dark:bg-neutral-800">
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<div
			on:click={() => goto('app/cycle')}
			class="flex flex-row items-center justify-center gap-4 bg-gradient-to-br from-indigo-500 to-indigo-600 py-3 px-5 text-white  font-semibold rounded-xl text-center transition-all hover:skew-y-[0.25deg] duration-200 ease-in-out cursor-pointer"
		>
			<div class="flex flex-row self-center gap-2 justify-center w-full">
				<svg
					id="glyphicons-basic"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 32 32"
					class="h-5 w-5 fill-white self-center {$machineData.cycle !== undefined &&
					$machineData.cycle.status.mode == 'started'
						? 'animate-spin2'
						: ''}"
				>
					<path
						id="roundabout"
						d="M20.74066,8.35083a9.46114,9.46114,0,0,0-1.8974-.889A8.86849,8.86849,0,0,0,10.8175,8.65308l1.3147,1.48169a.49991.49991,0,0,1-.314.82812L5.634,11.71021a.50014.50014,0,0,1-.54577-.615L6.56573,5.0437a.49994.49994,0,0,1,.85962-.21326l1.38959,1.566A12.10267,12.10267,0,0,1,10.62982,5.2688a11.96833,11.96833,0,0,1,9.16083-.6543,13.338,13.338,0,0,1,2.41321,1.11682.9863.9863,0,0,1,.37353,1.23133l-.39935.93579A.99067.99067,0,0,1,20.74066,8.35083ZM7.00529,15.71905a9.46141,9.46141,0,0,0,.17877,2.08772,8.86852,8.86852,0,0,0,5.04456,6.35486l.62584-1.8794a.49992.49992,0,0,1,.87419-.14211l3.73926,4.982a.50013.50013,0,0,1-.25971.78015l-5.9795,1.74622a.49993.49993,0,0,1-.6145-.63782l.66144-1.98644a12.10109,12.10109,0,0,1-1.884-1.00789,11.96834,11.96834,0,0,1-5.14706-7.60636,13.33711,13.33711,0,0,1-.2394-2.64831.98629.98629,0,0,1,.87959-.93915l1.01009-.122A.99066.99066,0,0,1,7.00529,15.71905ZM20.254,23.93012a9.46082,9.46082,0,0,0,1.71863-1.19868,8.86842,8.86842,0,0,0,2.9812-7.54615l-1.94053.39772a.49992.49992,0,0,1-.56016-.686l2.44487-5.72928a.50013.50013,0,0,1,.80549-.16516l4.502,4.30529a.49993.49993,0,0,1-.24513.85108l-2.051.42039a12.10248,12.10248,0,0,1,.06916,2.13558,11.96833,11.96833,0,0,1-4.01377,8.26066A13.3379,13.3379,0,0,1,21.791,26.507a.9863.9863,0,0,1-1.25313-.29217l-.61074-.81375A.99067.99067,0,0,1,20.254,23.93012Z"
					/>
				</svg>
				{$_('cycle.button')}

				{#if $machineData.cycle !== undefined}
					<span
						class="grid grid-cols-1 h-3 w-3 items-center justify-items-center ml-5 self-center"
					>
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
		</div>
		<div
			on:click={() => goto('/app/profiles')}
			class=" bg-gradient-to-br from-indigo-500 to-indigo-600 py-3 px-5 text-white font-semibold rounded-xl text-center transition-all hover:-skew-y-[0.25deg] duration-200 ease-in-out cursor-pointer"
		>
			<div class="flex flex-row self-center gap-2 justify-center w-full">
				<svg
					id="glyphicons-basic"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 32 32"
					class="h-5 w-5 fill-white self-center"
				>
					<path
						id="user"
						d="M27,24.23669V27a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V24.23669a1.57806,1.57806,0,0,1,.93115-1.36462L10.0672,20.167A5.02379,5.02379,0,0,0,14.55273,23h1.89454a5.02336,5.02336,0,0,0,4.48535-2.83313l5.13623,2.7052A1.57806,1.57806,0,0,1,27,24.23669ZM9.64478,14.12573a2.99143,2.99143,0,0,0,1.31073,1.462l.66583,3.05176A2.99994,2.99994,0,0,0,14.55237,21h1.89526a2.99994,2.99994,0,0,0,2.931-2.36047l.66583-3.05176a2.99115,2.99115,0,0,0,1.31073-1.462l.28-.75146A1.2749,1.2749,0,0,0,21,11.62988V9c0-3-2-5-5.5-5S10,6,10,9v2.62988a1.2749,1.2749,0,0,0-.63519,1.74439Z"
					/>
				</svg>

				{$_('profile.button')}
			</div>
		</div>
		<div
			on:click={() => goto('/app/advanced')}
			class=" bg-gradient-to-br from-indigo-500 to-indigo-600 py-3 px-5 text-white  font-semibold rounded-xl text-center transition-all hover:skew-y-[0.25deg] duration-200 ease-in-out cursor-pointer"
		>
			<div class="flex flex-row self-center gap-2 justify-center w-full">
				<svg
					id="glyphicons-basic"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 32 32"
					class="h-5 w-5 fill-white self-center"
				>
					<path
						id="switch-off"
						d="M21,7H11a9,9,0,0,0,0,18H21A9,9,0,0,0,21,7Zm0,15H11a6,6,0,0,1,0-12H21a6,6,0,0,1,0,12Zm-6-6a4,4,0,1,1-4-4A4.004,4.004,0,0,1,15,16Z"
					/>
				</svg>
				{$_('manual.button')}
			</div>
		</div>
	</div>
</div>

<div class="rounded-xl p-3 pt-0 mt-12 bg-neutral-300 dark:bg-neutral-800  group">
	<div class="flex flex-row justify-items-end -translate-y-4">
		<div
			class="rounded-full bg-indigo-400 text-white py-1 px-8 font-semibold  group-hover:scale-105 transition-all"
		>
			{$_('slots.name')}
		</div>
	</div>

	<div
		class="grid grid-cols-1 md:grid-cols-3 h-[50vh] md:h-full overflow-scroll md:overflow-visible gap-4"
	>
		{#each $machineData.slots.sort((a, b) => b.sensors.length - a.sensors.length) as slot}
			<SlotProduct slotContent={slot} />
		{/each}
	</div>
</div>

<div class="rounded-xl p-3 pt-0 mt-12 bg-neutral-300 dark:bg-neutral-800  group">
	<div class="flex flex-row justify-items-end -translate-y-4">
		<div
			class="rounded-full bg-indigo-400 text-white py-1 px-8 font-semibold  group-hover:scale-105 transition-all"
		>
			{$_('maintenance.list')}
		</div>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		{#each $machineData.maintenances.filter((m) => m.name !== 'cycleCount') as m}
			<Maintenance bind:maintenance={m} />
		{/each}
	</div>
</div>

<style>
	@keyframes spin2 {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(-360deg);
		}
	}

	.animate-spin2 {
		animation: spin2 3s linear infinite;
	}
</style>
