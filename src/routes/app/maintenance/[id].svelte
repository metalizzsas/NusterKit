<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async (ctx) => {
		let dt = await ctx.fetch(
			'http://' + (ctx.session.ip || '127.0.0.1') + '/v1/maintenance/' + ctx.params.id,
		);

		return { props: { maintenance: await dt.json() } };
	};
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Maintenance } from '$lib/utils/interfaces';
	import { _ } from 'svelte-i18n';
	import { fly } from 'svelte/transition';
	import { Linker } from '$lib/utils/linker';

	export let maintenance: Maintenance;

	let procedureIndex: number = 0;
	let procedureImageIndex: number = 0;

	async function resetMaintenance() {
		await fetch('http://' + $Linker + '/v1/maintenance/' + maintenance.name, {
			method: 'DELETE',
		});

		window.location.reload();
	}
</script>

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
			{$_('maintenance.tasks.' + maintenance.name + '.name')}
		</div>
		<span class="rounded-full bg-white py-1 px-3 ml-auto">
			<span class="font-semibold">{$_('maintenance.duration')}:</span>
			{maintenance.durationActual} / {maintenance.durationLimit}
			{$_('maintenance.unity.' + maintenance.durationType)}
		</span>
		<span class="rounded-full bg-white py-1 px-3">
			<span class="font-semibold">{$_('maintenance.percentage')}:</span>
			{maintenance.durationProgress} %
		</span>
	</div>

	<div class="mt-5">
		<p class="rounded-xl bg-white py-2 px-3 text-gray-800 mb-3 mr-auto">
			{$_('maintenance.tasks.' + maintenance.name + '.desc')}
		</p>

		{#if maintenance.procedure}
			<div class="grid grid-cols-3">
				<div class="rounded-l-xl overflow-hidden col-span-1">
					{#each maintenance.procedure.steps as step, index}
						{#if procedureIndex == index}
							<div>
								<img
									src="http://{$Linker}/assets/maintenance/{maintenance.name}/{step
										.images[procedureImageIndex]}"
									alt="procedure"
									class="shrink-0 transition-all"
								/>
								{#if step.images.length > 1}
									<div class="flex flex-row justify-center">
										<div class="absolute flex flex-row gap-4 -translate-y-24">
											{#each step.images as image, indeximge}
												<div
													on:click={() =>
														(procedureImageIndex = indeximge)}
												>
													<!-- svelte-ignore a11y-missing-attribute -->
													<img
														src="http://{$Linker}/assets/maintenance/{maintenance.name}/{image}"
														class="h-20 rounded-md {procedureImageIndex !=
														indeximge
															? 'ring-white ring-1'
															: 'ring-blue-500 ring-offset-2 ring-2'}"
													/>
												</div>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						{/if}
					{/each}
				</div>
				<div class="bg-white rounded-r-xl col-span-2 p-5 relative">
					<div class="flex flex-row justify-center">
						<span
							class="text-white font-semibold mb-3 bg-violet-700 py-2 px-4 rounded-full m-auto"
						>
							{$_('maintenance.procedure')}
						</span>
					</div>

					<div class="mb-5 flex flex-row gap-4 justify-items-start">
						<span class="rounded-full bg-violet-500 py-1 px-5 text-white font-medium">
							{$_('maintenance.tools-used')}
						</span>

						{#each maintenance.procedure.tools ?? [] as tool}
							<span class="bg-violet-300 py-1 px-3 text-white rounded-full">
								{$_('maintenance.tools.' + tool)}
							</span>
						{:else}
							<span class="bg-violet-300 py-1 px-3 text-white rounded-full">
								{$_('maintenance.tools.none')}
							</span>
						{/each}
					</div>

					<p class="font-semibold text-gray-800">
						{$_(
							'maintenance.tasks.' +
								maintenance.name +
								'.procedure.' +
								maintenance.procedure.steps[procedureIndex].name,
						)}
					</p>

					<div
						class="absolute bottom-5 right-5 left-5 flex flex-row gap-4 mt-4 justify-items-start"
					>
						<button
							class="{procedureIndex < 1
								? 'bg-gray-300'
								: 'bg-indigo-500'} text-white font-semibold rounded-xl py-2 px-4 self-start"
							on:click={() => {
								if (procedureIndex > 0) {
									procedureIndex--;
									procedureImageIndex = 0;
								}
							}}
						>
							{$_('maintenance.procedure.previous')}
						</button>

						<button
							class="{procedureIndex < maintenance.procedure.steps.length - 1
								? 'bg-indigo-500'
								: 'bg-gray-300'} text-white font-semibold rounded-xl py-2 px-4 self-end"
							on:click={() => {
								if (procedureIndex < maintenance.procedure.steps.length - 1) {
									procedureIndex++;
									procedureImageIndex = 0;
								}
							}}
						>
							{$_('maintenance.procedure.next')}
						</button>

						<button
							class="{procedureIndex == maintenance.procedure.steps.length - 1
								? 'bg-emerald-500'
								: 'bg-gray-300'} text-white font-semibold rounded-xl py-2 px-4"
							on:click={() => {
								if (procedureIndex == maintenance.procedure.steps.length - 1)
									resetMaintenance();
							}}
						>
							{$_('maintenance.procedure.reset')}
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
