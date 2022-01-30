<script lang="ts">
	import { _ } from 'svelte-i18n';
	import '$lib/app.css';

	import { machineData } from '$lib/utils/store';

	import Cyclepreparation from '$lib/components/cycle/cyclepreparation.svelte';
	import Cyclewatchdog from '$lib/components/cycle/cyclewatchdog.svelte';
	import Cyclerunning from '$lib/components/cycle/cyclerunning.svelte';
	import Cycleend from '$lib/components/cycle/cycleend.svelte';
</script>

<div>
	<div class="rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-200 dark:bg-neutral-800 shadow-xl group">
		<div class="flex flex-row gap-5 justify-items-end -translate-y-4">
			<a
				href="/app"
				class="rounded-xl bg-red-400 text-white py-1 px-3 font-semibold flex flex-row gap-2 items-center"
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
			</a>
			<div
				class="rounded-xl bg-indigo-500 text-white py-1 px-8 font-semibold shadow-md group-hover:scale-105 transition-all"
			>
				{$machineData.cycle ? $_('cycle.button') : $_('cycle.preparation')}
			</div>
			<!-- TODO: Add check if some histories are available -->
			<a
				class="rounded-xl bg-orange-500 text-white py-1 px-8 font-semibold shadow-md group-hover:scale-[1.01] transition-all self-end"
				href="cycle/histories"
			>
				{$_('cycle.history')}
			</a>
		</div>

		<div id="cycle">
			{#if $machineData.cycle === undefined}
				<Cyclepreparation />
			{:else if $machineData.cycle.status.mode === 'created'}
				<Cyclewatchdog />
			{:else if $machineData.cycle.status.mode === 'started'}
				<Cyclerunning />
			{:else if $machineData.cycle.status.mode === 'ended'}
				<Cycleend />
			{/if}
		</div>
	</div>
</div>
