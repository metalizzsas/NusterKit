<script lang="ts">
	import Toggle from '../userInputs/toggle.svelte';
	import TimeSelector from '../userInputs/timeselector.svelte';
	import Inputkb from '../userInputs/inputkb.svelte';
	import { _ } from 'svelte-i18n';
	import type { IProfileHydrated } from '@metalizz/nuster-typings/src/hydrated/profile';
	import type { ProfileSkeletonFields } from '@metalizz/nuster-typings/src/spec/profile';

	export let profile: IProfileHydrated
	export let row: ProfileSkeletonFields;
</script>

<div
	class="bg-zinc-400 dark:bg-zinc-500 rounded-3xl py-1 px-3 flex flex-row justify-between items-center"
>
	<span class="text-white">
		{$_('profile.rows.' + row.name)}
	</span>

	<div class="-mr-2 flex flex-row gap-3">
		{#if row.type === 'bool'}
			<Toggle
				bind:value={row.value}
				locked={!profile.overwriteable}
				enableGrayScale={!profile.overwriteable}
			/>
		{:else if row.type === 'float'}
			<input
				type="range"
				class="bg-white dark:bg-zinc-600 accent-indigo-500"
				bind:value={row.value}
				min={row.floatMin}
				max={row.floatMax}
				step={row.floatStep}
				disabled={!profile.overwriteable}
			/>
			{#if row.unity !== undefined}
				<span class="bg-white text-zinc-800 py-0.5 px-2 text-center rounded-full">
					{row.value}
					<span class="font-semibold">{row.unity}</span>
				</span>
			{/if}
		{:else if row.type === 'time'}
			<div class="text-md">
				<TimeSelector
					bind:value={row.value}
					enabledTimes={row.units}
					disabled={!profile.overwriteable}
				/>
			</div>
		{:else if row.type === 'int'}
			<div
				class="flex flex-row gap-2 items-center bg-white dark:bg-zinc-600 px-3 py-1 rounded-full font-semibold"
			>
				<Inputkb
					bind:value={row.value}
					disabled={!profile.overwriteable}
					options={{ class: 'bg-white dark:bg-zinc-600' }}
				/>
				{#if row.unity !== undefined}
					<span class="font-semibold px-2">{row.unity}</span>
				{/if}
			</div>
		{/if}
	</div>
</div>
