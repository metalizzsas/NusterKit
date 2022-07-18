<script lang="ts">
	import '$lib/app.css';
	import endSound from '$lib/sounds/cycle-end.wav';
	import { onDestroy, onMount } from 'svelte';

	import howler from 'howler';
	import { machineData } from '$lib/utils/store';
	import { Linker } from '$lib/utils/linker';
	import { time, _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { navTitle } from '$lib/utils/navstack';

	let rating = 0;

	let endSoundInstance: howler.Howl | null = null;

	onMount(() => {
		endSoundInstance = new howler.Howl({
			src: [endSound],
			loop: true,
			volume: 0.5,
			autoplay: true,
		});
	});

	onDestroy(() => {
		if (endSoundInstance) {
			endSoundInstance.stop();
		}
	});

	async function patchCycle() {
		await fetch('//' + $Linker + '/api/v1/cycle/' + rating, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		goto('/app');
	}

	const parseDuration = (start: number, end: number) => {
		const diff = end - start;

		const hours = new Date(diff).getHours() - 1;
		const minutes = new Date(diff).getMinutes();
		const seconds = new Date(diff).getSeconds();

		const hoursShown = hours > 0;
		const hoursPlural = hours != 1;
		const minutesPlural = minutes != 1;
		const secondsPlural = seconds != 1;

		return (
			(hoursShown ? `${hours} ${$_(hoursPlural ? 'date.hours' : 'date.hour')}` : ``) +
			` ${minutes} ${$_(minutesPlural ? 'date.minutes' : 'date.minute')} ${seconds} ${$_(
				secondsPlural ? 'date.seconds' : 'date.second',
			)}`
		);
	};

	$navTitle = [$_('cycle.button'), $_('cycle.end.cycle-ended')];
</script>

<div class="text-zinc-800">
	<div class="flex flex-col gap-4">
		<section class="flex flex-row gap-4 justify-center align-middle items-center">
			<div class="rounded-full bg-white p-4 shadow-lg">
				{#if $machineData.cycle?.status.endReason != 'finished'}
					<svg
						id="glyphicons-basic"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 32 32"
						class="fill-red-500 h-12 w-12 rotate-45"
					>
						<path
							id="plus"
							d="M27,14v4a1,1,0,0,1-1,1H19v7a1,1,0,0,1-1,1H14a1,1,0,0,1-1-1V19H6a1,1,0,0,1-1-1V14a1,1,0,0,1,1-1h7V6a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v7h7A1,1,0,0,1,27,14Z"
						/>
					</svg>
				{:else}
					<svg
						id="glyphicons-basic"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 32 32"
						class="fill-emerald-500 h-12 w-12"
					>
						<path
							id="check"
							d="M27.37592,9.70459l-14.151,15.97693a.99985.99985,0,0,1-1.47558.02356L4.59711,18.1322a.99992.99992,0,0,1-.05384-1.31128L5.495,15.63123a.99994.99994,0,0,1,1.22808-.26966L12,18,24.79724,7.09863a.99991.99991,0,0,1,1.35553.0542l1.1817,1.18164A1,1,0,0,1,27.37592,9.70459Z"
						/>
					</svg>
				{/if}
			</div>

			<div class="flex flex-row gap-2">
				<div class="bg-gray-400 h-2 aspect-square rounded-xl animate-pulse" />
				<div class="bg-gray-500 h-2 aspect-square rounded-xl animate-pulse" />
				<div class="bg-gray-400 h-2 aspect-square rounded-xl animate-pulse" />
			</div>

			<div class="flex flex-col p-3 rounded-xl bg-white">
				<span class="font-semibold">
					{$_('cycle.endreasons.' + $machineData.cycle?.status.endReason)}
				</span>
				{#if $machineData.cycle?.status.startDate && $machineData.cycle?.status.endDate}
					<span class="text-italic">
						{$_('cycle.end.cycle-duration')} : {parseDuration(
							$machineData.cycle?.status.startDate,
							$machineData.cycle?.status.endDate,
						)}
					</span>
				{/if}
			</div>
		</section>
		<section class="font-semibold text-center p-3 rounded-xl bg-white mx-auto">
			<p class="mb-1">{$_('cycle.end.cycle-rating-lead')}</p>
			<p class="font-normal">
				{$_('cycle.end.cycle-rating-text')}
			</p>
			<p class="font-normal">
				{$_('cycle.end.cycle-rating-text2')}
			</p>
		</section>
		<div
			class="flex flex-row items-center gap-4 self-center bg-white rounded-full p-2 shadow-xs"
		>
			{#each [1, 2, 3, 4, 5] as i}
				<svg
					id="glyphicons-basic"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 32 32"
					class="h-7 w-7 self-center transition-all {rating >= i
						? 'fill-amber-500'
						: 'fill-gray-500'}"
					on:click={() => (rating == i ? (rating = 0) : (rating = i))}
				>
					<path
						id="star"
						d="M27.34766,14.17944l-6.39209,4.64307,2.43744,7.506a.65414.65414,0,0,1-.62238.85632.643.643,0,0,1-.38086-.12744l-6.38568-4.6383-6.38574,4.6383a.643.643,0,0,1-.38086.12744.65419.65419,0,0,1-.62238-.85632l2.43744-7.506L4.66046,14.17944A.65194.65194,0,0,1,5.04358,13h7.89978L15.384,5.48438a.652.652,0,0,1,1.24018,0L19.06476,13h7.89978A.652.652,0,0,1,27.34766,14.17944Z"
					/>
				</svg>
			{/each}
		</div>

		<div class="h-[1px] bg-zinc-400 w-2/3 mx-auto" />

		<button
			class="bg-indigo-500 py-2 px-4 rounded-xl text-white font-semibold"
			on:click={patchCycle}
		>
			{$_('cycle.buttons.complete')}
		</button>
	</div>
</div>
