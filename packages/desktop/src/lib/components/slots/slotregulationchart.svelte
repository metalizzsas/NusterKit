<script lang="ts">
	import type { IRegulationStoredData } from "@metalizzsas/nuster-typings/build/hydrated/slot/regulation";
    
    import { _, time } from 'svelte-i18n';
    import Actionmodal from "../modals/actionmodal.svelte";
    import Chart from 'chart.js/auto/auto.mjs';

    export let logData: IRegulationStoredData[];

    export let shown = false;

    let chartCanvas: HTMLCanvasElement;

    let chart: Chart | undefined;
    let chartUpdateInterval: ReturnType<typeof setInterval> | undefined;

	const openChart = () => {
		chart = new Chart(chartCanvas, {
			type: 'line',
			data: {
				labels: logData.map((ld) => $time(Date.parse(ld.time))),
				datasets: [
					{
						label: $_('slots.regulation.target'),
						data: logData.map((ld) => ld.targetValue),
						borderWidth: 2,
						borderColor: '#f59e0b',
						backgroundColor: '#fcd34d',
						cubicInterpolationMode: 'monotone',
						tension: 0.4,
					},
					{
						label: $_('slots.regulation.current'),
						data: logData.map((ld) => ld.currentValue),
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

		chartUpdateInterval = setInterval(() => { 
			if(chart)
			{
				chart.data.labels = logData.map((ld) => $time(Date.parse(ld.time)));
				chart.data.datasets.at(0)!.data = logData.map((ld) => ld.targetValue);
				chart.data.datasets.at(1)!.data = logData.map((ld) => ld.currentValue);
				chart.update();
			}
		}, 10000);
	};

	$: if (chartCanvas != null && shown == true) {
		openChart();
	}

	$: if(shown == false) {
		if(chartUpdateInterval)
			clearInterval(chartUpdateInterval)
	}

</script>

<Actionmodal bind:shown={shown} zIndex={100}>
	<h2 class="text-xl leading-6">{$_('slots.regulation.chart.title')}</h2>
	<canvas id="datalog" class="" bind:this={chartCanvas} />
</Actionmodal>