<script lang="ts">
	import '$lib/app.css';
	import endSound from '$lib/sounds/cycle-end.wav';
	import { onDestroy, onMount } from 'svelte';

	import howler from 'howler';
	import { machineData } from '$lib/utils/store';
	import { Linker } from '$lib/utils/linker';
	import { _ } from 'svelte-i18n';

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
		await fetch('http://' + $Linker + '/v1/cycle/' + rating, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		window.history.back();
	}
</script>

<div>
	<div class="flex flex-col gap-4">
		<p class="rounded-xl py-2 px-3 bg-white text-gray-800 flex flex-col font-semibold">
			{$_('cycle.end.cycle-ended')}
			<span class="text-xs text-italic font-normal">
				{$_('cycle.end.cycle-ended-reason')} : {$_(
					'cycle.endreasons.' + $machineData.cycle?.status.endReason,
				)}
			</span>
		</p>
		<div class="rounded-xl py-2 px-3 bg-white text-gray-800 font-semibold">
			{$_('cycle.end.cycle-rating-lead')}
			<p class="font-normal">
				{$_('cycle.end.cycle-rating-text')}
			</p>
			<p class="font-normal mt-2">
				{$_('cycle.end.cycle-rating-text2')}
			</p>
		</div>
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

		<button
			class="bg-indigo-500 py-2 px-4 rounded-xl text-white font-semibold"
			on:click={patchCycle}
		>
			{$_('cycle.buttons.complete')}
		</button>
	</div>
</div>
