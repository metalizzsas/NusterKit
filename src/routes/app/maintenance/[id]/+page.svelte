<script lang="ts">
	import { goto } from '$app/navigation';
	import { _ } from 'svelte-i18n';
	import { Linker } from '$lib/utils/linker';
	import { navActions, navTitle, useNavContainer } from '$lib/utils/navstack';
	import Navcontainer from '$lib/components/navigation/navcontainer.svelte';
	import Navcontainertitle from '$lib/components/navigation/navcontainertitle.svelte';
	import Navcontainersubtitle from '$lib/components/navigation/navcontainersubtitle.svelte';

	import type { PageData } from './$types';

	export let data: PageData;

	let procedureIndex: number = 0;
	let procedureImageIndex: number = 0;

	async function resetMaintenance() {
		await fetch('//' + $Linker + '/api/v1/maintenance/' + data.maintenance.name, {
			method: 'DELETE',
		});
		goto('/app');
	}

	$navTitle = [
		$_('maintenance.list'),
		$_('maintenance.tasks.' + data.maintenance.name + '.name'),
	];
	$useNavContainer = false;
	$navActions = [];

	let imageExpanded = false;
</script>

<div class="flex flex-col gap-6">
	<Navcontainer classes={'mt-0'}>
		<Navcontainertitle>
			{$_('maintenance.tasks.' + data.maintenance.name + '.name')}
		</Navcontainertitle>

		<Navcontainersubtitle>{$_('maintenance.description')}</Navcontainersubtitle>
		<p>{$_('maintenance.tasks.' + data.maintenance.name + '.desc')}</p>
		<p class="mt-2">
			<span class="font-bold">
				{$_('maintenance.duration')}:
			</span>
			<span class="font-semibold">{data.maintenance.durationActual}</span>
			/ {data.maintenance.durationLimit}
			{$_('maintenance.unity.' + data.maintenance.durationType)}
		</p>
	</Navcontainer>

	{#if data.maintenance.procedure !== undefined}
		<div class="relative grid grid-cols-6 gap-6">
			<div
				class="rounded-xl overflow-hidden {imageExpanded ? 'col-span-3' : 'col-span-2'}"
				style="min-aspect-ratio: 1/1;"
			>
				{#each data.maintenance.procedure.steps as step, index}
					{#if procedureIndex == index}
						<div>
							<img
								src="//{$Linker}/api/assets/maintenance/ {data.maintenance
									.name}/{step.media[procedureImageIndex]}"
								alt="procedure"
								class="shrink-0 transition-all cursor-pointer w-full"
								on:click|self={() => {
									imageExpanded = !imageExpanded;
								}}
							/>
							{#if step.media.length > 1}
								<div class="flex flex-row justify-center">
									<div
										class="absolute flex flex-row bottom-5 rounded-xl overflow-clip ring-1 ring-neutral-300"
									>
										{#each step.media as _image, indeximge}
											<div on:click={() => (procedureImageIndex = indeximge)}>
												<div
													class="h-10 aspect-square bg-white text-zinc-800 text-xl flex flex-row items-center justify-center border-r-[1px] border-neutral-300 {procedureImageIndex !=
													indeximge
														? ''
														: 'font-bold'}"
												>
													{indeximge + 1}
												</div>
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/if}
				{/each}
			</div>

			<Navcontainer
				classes={imageExpanded ? 'col-span-3 mt-0 relative' : 'col-span-4 mt-0 relative'}
			>
				<Navcontainertitle>{$_('maintenance.procedure.title')}</Navcontainertitle>
				{#if procedureIndex < data.maintenance.procedure.steps.length - 1}
					<!--Next button -->
					<button
						class="absolute right-0 bottom-3 bg-white rounded-l-full p-3 flex flex-row gap-3 items-center"
						on:click={() => {
							//@ts-ignore
							if (procedureIndex < data.maintenance.procedure.steps.length - 1) {
								procedureIndex++;
								procedureImageIndex = 0;
							}
						}}
					>
						<span class="text-zinc-700">{$_('maintenance.procedure.next')}</span>

						<svg
							id="glyphicons-basic"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 32 32"
							class=" h-6 w-6 fill-zinc-700 animate-bounce-x"
						>
							<path
								id="arrow-thin-right"
								d="M27.12152,16.707,19.35358,24.4751a.5.5,0,0,1-.70716,0L16.525,22.35352a.49983.49983,0,0,1,0-.707L20.17139,18H5a1,1,0,0,1-1-1V15a1,1,0,0,1,1-1H20.17139L16.525,10.35352a.49983.49983,0,0,1,0-.707L18.64642,7.5249a.5.5,0,0,1,.70716,0L27.12152,15.293A.99986.99986,0,0,1,27.12152,16.707Z"
							/>
						</svg>
					</button>
				{/if}

				{#if procedureIndex > 0}
					<!-- Prev button -->
					<button
						class="absolute left-0 bottom-3 bg-white rounded-r-full p-3 flex flex-row gap-2 items-center"
						on:click={() => {
							if (procedureIndex > 0) {
								procedureIndex--;
								procedureImageIndex = 0;
							}
						}}
					>
						<svg
							id="glyphicons-basic"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 32 32"
							class=" h-6 w-6 fill-zinc-700 animate-bounce-x"
						>
							<path
								id="arrow-thin-left"
								d="M28,15v2a1,1,0,0,1-1,1H11.82861L15.475,21.64648a.49983.49983,0,0,1,0,.707L13.35358,24.4751a.5.5,0,0,1-.70716,0L4.87848,16.707a.99986.99986,0,0,1,0-1.41406L12.64642,7.5249a.5.5,0,0,1,.70716,0L15.475,9.64648a.49983.49983,0,0,1,0,.707L11.82861,14H27A1,1,0,0,1,28,15Z"
							/>
						</svg>
						<span class="text-zinc-700">{$_('maintenance.procedure.previous')}</span>
					</button>
				{/if}

				{#if procedureIndex == data.maintenance.procedure.steps.length - 1}
					<button
						class="bg-emerald-500 text-white font-semibold rounded-l-xl py-2 px-4 absolute bottom-5 right-0"
						on:click={() => {
							//@ts-ignore
							if (procedureIndex == data.maintenance.procedure.steps.length - 1)
								resetMaintenance();
						}}
					>
						{$_('maintenance.procedure.reset')}
					</button>
				{/if}

				{#if data.maintenance.procedure.tools.length > 0}
					<div class="mb-5 flex flex-row gap-4 justify-items-start">
						{#each data.maintenance.procedure.tools ?? [] as tool}
							<span class="bg-violet-300 py-1 px-3 text-white rounded-full">
								{$_('maintenance.tools.' + tool)}
							</span>
						{/each}
					</div>
				{/if}

				<p class="font-semibold">
					{$_(
						'maintenance.tasks.' +
							data.maintenance.name +
							'.procedure.' +
							data.maintenance.procedure.steps[procedureIndex].name,
					)}
				</p>
			</Navcontainer>
		</div>
	{/if}
</div>
