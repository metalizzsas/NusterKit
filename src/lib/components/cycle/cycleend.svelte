<script lang="ts">
	import '$lib/app.css';
	import endSound from '$lib/sounds/cycle-end.wav';
	import { onDestroy, onMount } from 'svelte';

	import howler from 'howler';

	let rating = 2;

	let endSoundInstance: howler.Howl | null = null;

	onMount(() => {
		endSoundInstance = new howler.Howl({
			src: [endSound],
			loop: true,
			volume: 0.5,
		});

		endSoundInstance.play();
	});

	onDestroy(() => {
		if (endSoundInstance) {
			endSoundInstance.stop();
		}
	});

	async function patchCycle() {
		await fetch('http://127.0.0.1/v1/cycle/' + rating, {
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
		{#each [1, 2, 3, 4, 5] as i}
			<svg
				id="glyphicons-basic"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 32 32"
				class="h-5 w-5 self-center {rating == i ? 'fill-amber-500' : 'fill-gray-500'}"
				on:click={() => (rating = i)}
			>
				<path
					id="star"
					d="M27.34766,14.17944l-6.39209,4.64307,2.43744,7.506a.65414.65414,0,0,1-.62238.85632.643.643,0,0,1-.38086-.12744l-6.38568-4.6383-6.38574,4.6383a.643.643,0,0,1-.38086.12744.65419.65419,0,0,1-.62238-.85632l2.43744-7.506L4.66046,14.17944A.65194.65194,0,0,1,5.04358,13h7.89978L15.384,5.48438a.652.652,0,0,1,1.24018,0L19.06476,13h7.89978A.652.652,0,0,1,27.34766,14.17944Z"
				/>
			</svg>
		{/each}
		<button
			class="bg-indigo-500 py-2 px-4 rounded-xl text-white font-semibold"
			on:click={patchCycle}
		>
			Terminer le cycle
		</button>
	</div>
</div>
