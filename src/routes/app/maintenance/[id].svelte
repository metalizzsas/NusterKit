<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async (ctx) => {
		let dt = await ctx.fetch('http://127.0.0.1/v1/maintenance/' + ctx.params.id);

		return { props: { maintenance: await dt.json() } };
	};
</script>

<script lang="ts">
	import type { Maintenance } from '$lib/utils/interfaces';
	import { _ } from 'svelte-i18n';
	import { fly } from 'svelte/transition';

	export let maintenance: Maintenance;

	let procedureIndex: number = 0;
	let procedureImageIndex: number = 0;

	async function resetMaintenance() {
		await fetch('http://localhost/v1/maintenance/' + maintenance.name, {
			method: 'DELETE',
		});

		window.location.reload();
	}
</script>

<div class="rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-200 dark:bg-neutral-800 shadow-xl group">
	<div class="flex flex-row gap-5 justify-items-end -translate-y-4">
		<a
			href="/app/"
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
			{maintenance.name}
		</div>
	</div>
	<div id="maintenanceContent">
		<div class="flex flex-col gap-4">
			<span class="rounded-full bg-white py-1 px-3 self-start">
				<span class="font-semibold">{$_('maintenance.duration')}:</span>
				{maintenance.durationActual} / {maintenance.durationLimit}
				{$_('maintenance.unity.' + maintenance.durationType)}
			</span>
			<span class="rounded-full bg-white py-1 px-3 self-start">
				<span class="font-semibold">{$_('maintenance.percentage')}:</span>
				{maintenance.durationProgress} %
			</span>
			<p class="rounded-xl bg-zinc-900 py-2 px-3 text-white text-xl mb-3">
				{$_(maintenance.name + '-desc')}
			</p>
		</div>

		<div class="procedure mt-5">
			<h1 class="text-xl">{$_('maintenance.procedure')}</h1>
			<div class="container flex flex-col justify-center">
				{#each maintenance.procedure.steps as step, index}
					{#if procedureIndex == index}
						<div
							class="step rounded-xl overflow-hidden"
							out:fly={{ x: -100, duration: 50 }}
							in:fly={{ x: 100, duration: 50 }}
						>
							<img
								src="http://127.0.0.1/assets/maintenance/{maintenance.name}/{step
									.images[procedureImageIndex]}"
								alt="procedure"
								class="shrink-0"
							/>
							{#if step.images.length > 0}
								<div class="flex flex-row justify-center">
									<div class="absolute flex flex-row gap-4 -translate-y-40">
										{#each step.images as image, indeximge}
											<div
												class="transition-all {procedureImageIndex !=
												indeximge
													? 'grayscale'
													: 'grayscale-50'}"
												on:click={() => (procedureImageIndex = indeximge)}
											>
												<!-- svelte-ignore a11y-missing-attribute -->
												<img
													src="http://localhost/assets/maintenance/{maintenance.name}/{image}"
													class="h-32 ring-white rounded-md"
												/>
											</div>
										{/each}
									</div>
								</div>
							{/if}
							<div class="bg-white p-3">
								<h2>{step.name}</h2>
							</div>
						</div>
					{/if}
				{/each}
			</div>

			<div class="flex flex-row gap-4 mt-4 w-full justify-items-center">
				{#if procedureIndex > 0}
					<button
						class="bg-gray-700 text-white font-semibold rounded-xl py-2 px-4 self-start"
						on:click={() => procedureIndex--}
					>
						{$_('maintenance.procedure.previous')}
					</button>
				{/if}

				{#if procedureIndex < maintenance.procedure.steps.length - 1}
					<button
						class="bg-gray-600 text-white font-semibold rounded-xl py-2 px-4 self-end"
						on:click={() => procedureIndex++}
					>
						{$_('maintenance.procedure.next')}
					</button>
				{/if}

				{#if procedureIndex == maintenance.procedure.steps.length - 1}
					<button
						class="bg-red-500 text-white font-semibold rounded-xl py-2 px-4"
						on:click={() => resetMaintenance()}
					>
						{$_('maintenance.procedure.reset')}
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>
