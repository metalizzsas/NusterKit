<script context="module" lang="ts">
	import type { Cycle, Profile } from '$lib/utils/interfaces';
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async (ctx) => {
		let content = await ctx.fetch(
			'//' + (window.localStorage.getItem('ip') ?? '127.0.0.1') + '/api/v1/cycle/history',
		);
		return { props: { histories: (await content.json()) as IHistory[] } };
	};

	interface IHistory {
		id: string;
		rating: number;
		cycle: Cycle;
		profile: Profile;
	}
</script>

<script lang="ts">
	import { date, time, _ } from 'svelte-i18n';
	import '$lib/app.css';
	import { goto } from '$app/navigation';
	import { Linker } from '$lib/utils/linker';
	import { navTitle } from '$lib/utils/navstack';
	import Modal from '$lib/components/modals/modal.svelte';

	export let histories: IHistory[];

	let showRetakeModal = false;
	let selectedHistory: IHistory | null;

	async function restartCycle(his: IHistory) {
		await fetch('//' + $Linker + '/api/v1/cycle/restart/' + his.id, { method: 'POST' });
		goto('/app/cycle/');
	}

	function showRetakeModalHandler(his: IHistory) {
		selectedHistory = his;
		showRetakeModal = true;
	}

	$navTitle = [$_('cycle.button'), $_('cycle.history')];
</script>

<Modal
	title={$_('cycle.histories.retake.title')}
	bind:shown={showRetakeModal}
	buttons={[
		{
			text: $_('yes'),
			color: 'bg-emerald-500',
			callback: async () => {
				if (selectedHistory) await restartCycle(selectedHistory);
			},
		},
		{
			text: $_('cancel'),
			color: 'bg-gray-500',
		},
	]}
>
	{$_('cycle.histories.retake.main')}
</Modal>

<div class="flex flex-col gap-4">
	{#each histories as history}
		<div
			class="flex flex-row gap-4 justify-between bg-zinc-700 p-3 text-white rounded-xl items-center"
		>
			<div class="flex flex-col">
				<span class="font-semibold">{$_('cycle.names.' + history.cycle.name)}</span>
				<span class="italic text-gray-300 font-xs">
					{$date(new Date(history.cycle.status.endDate || 0), {
						format: 'medium',
					})} : {$time(new Date(history.cycle.status.endDate || 0), {
						format: 'medium',
					})}
				</span>
			</div>
			<div class="flex flex-row gap-2 ml-auto">
				{#if history.cycle.status.endReason != 'finished'}
					<button
						class="bg-red-500 rounded-xl text-white font-semibold py-1 px-2"
						on:click={() => showRetakeModalHandler(history)}
					>
						{$_('cycle.buttons.resume')}
					</button>
				{/if}
				<div
					class="rounded-full bg-white py-1 px-3 {(history.cycle.status.endReason ||
						'user') == 'finished'
						? 'text-emerald-500 font-semibold'
						: 'text-gray-700 font-medium'}"
				>
					{$_('cycle.endreasons.' + history.cycle.status.endReason || 'finished')}
				</div>

				<div class="flex flex-row items-center gap-1 self-center bg-white rounded-full p-1">
					{#each [1, 2, 3, 4, 5] as i}
						<svg
							id="glyphicons-basic"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 32 32"
							class="h-5 w-5 self-center transition-all {history.rating >= i
								? 'fill-amber-500'
								: 'fill-gray-500'}"
						>
							<path
								id="star"
								d="M27.34766,14.17944l-6.39209,4.64307,2.43744,7.506a.65414.65414,0,0,1-.62238.85632.643.643,0,0,1-.38086-.12744l-6.38568-4.6383-6.38574,4.6383a.643.643,0,0,1-.38086.12744.65419.65419,0,0,1-.62238-.85632l2.43744-7.506L4.66046,14.17944A.65194.65194,0,0,1,5.04358,13h7.89978L15.384,5.48438a.652.652,0,0,1,1.24018,0L19.06476,13h7.89978A.652.652,0,0,1,27.34766,14.17944Z"
							/>
						</svg>
					{/each}
				</div>
			</div>
		</div>
	{/each}
</div>
