<script lang="ts">
	import { _, time } from 'svelte-i18n';
	import { Linker } from '$lib/utils/linker';
	import Chart from 'chart.js/auto/auto.mjs';

	import Toggle from '../userInputs/toggle.svelte';
	import type { Passive } from '$lib/utils/interfaces';
	import Inputkb from '../userInputs/inputkb.svelte';
	import Navcontainersubtitle from '../navigation/navcontainersubtitle.svelte';
	import Actionmodal from '../modals/actionmodal.svelte';

	export let passive: Passive;

	let target = passive.target;

	let showlogPoints = false;
	let chartCanvas: HTMLCanvasElement;

	const triggerState = async (state: boolean) => {
		await fetch('//' + $Linker + '/api/v1/passives/' + passive.name + '/state/' + state, {
			method: 'POST',
		});
	};
	const triggerTarget = async (target: number) => {
		await fetch('//' + $Linker + '/api/v1/passives/' + passive.name + '/target/' + target, {
			method: 'POST',
		});
	};

	const openChart = async () => {
		new Chart(chartCanvas, {
			type: 'line',
			data: {
				labels: passive.logData.map((ld) => $time(Date.parse(ld.time))),
				datasets: [
					{
						label: $_('passives.target'),
						data: passive.logData.map((ld) => ld.targetValue),
						borderWidth: 2,
						borderColor: '#f59e0b',
						backgroundColor: '#fcd34d',
						cubicInterpolationMode: 'monotone',
						tension: 0.4,
					},
					{
						label: $_('passives.current'),
						data: passive.logData.map((ld) => ld.interpolatedSensorsValue),
						borderWidth: 2,
						borderColor: '#ef4444',
						backgroundColor: '#fca5a5',
						cubicInterpolationMode: 'monotone',
						tension: 0.4,
					},
				],
			},
			options: {
				animation: {
					duration: 0,
				},
				devicePixelRatio: 2,
				scales: {
					y: {
						beginAtZero: true,
					},
				},
			},
		});
	};

	$: target, triggerTarget(target);
	$: if (chartCanvas != null && showlogPoints == true) {
		openChart();
	}
</script>

<Actionmodal bind:shown={showlogPoints}>
	<h2 class="text-xl leading-6">{$_('passives.chart.title')}</h2>
	<canvas id="datalog" class="" bind:this={chartCanvas} />
</Actionmodal>

<div>
	<div
		class="p-3 bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-tr-2xl rounded-tl-2xl overflow-hidden transition-all flex flex-row gap-2 items-center align-middle md:gap-0 justify-between"
	>
		<span class="bg-white py-1 px-3 rounded-full text-gray-800 font-semibold">
			{$_('passives.' + passive.name + '.name')}
		</span>
		<Toggle bind:value={passive.state} on:change={(e) => triggerState(e.detail.value)} />
	</div>

	<div class="bg-white p-3 rounded-br-2xl rounded-bl-2xl">
		<Navcontainersubtitle>{$_('passives.settings')}</Navcontainersubtitle>
		<div class="flex flex-col gap-3">
			<div
				class="flex flex-row justify-between items-center rounded-full bg-zinc-700 p-1 pl-3 text-white"
			>
				{$_('passives.current')}
				<span class="text-zinc-700 py-1 px-3 rounded-full bg-white font-semibold">
					{passive.current}
				</span>
			</div>

			<div
				class="flex flex-row justify-between items-center rounded-full bg-zinc-700 p-1 pl-3 text-white"
			>
				{$_('passives.target')}
				<Inputkb
					bind:value={target}
					options={{
						class: 'w-1/3 bg-white text-zinc-700 px-3 py-1 rounded-full font-semibold',
					}}
				/>
			</div>
			<button
				class="self-start py-2 px-5 bg-indigo-500 font-semibold text-white rounded-xl cursor-pointer hover:scale-[1.01]"
				on:click={() => {
					showlogPoints = true;
				}}
			>
				{$_('passives.chart.show')}
			</button>
		</div>
	</div>
</div>
