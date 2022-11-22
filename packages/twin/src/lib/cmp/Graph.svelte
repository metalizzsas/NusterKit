<script lang="ts">
	import type { ChartData } from "$lib/utils/ChartTypes";
    import Chart from "chart.js/auto/auto.mjs";
    import { onMount } from "svelte";

    export let chartData: ChartData;

    let chartCanvas: HTMLCanvasElement | undefined;
    let chart: Chart | undefined;

    onMount(() => {

        if(chartCanvas !== undefined)
        {
            chart = new Chart(chartCanvas, {
                type: "line",
                data: {
                    labels: chartData.times,
                    datasets: chartData.data 
                }
            });
        }
    });

    const updateGraph = () => {

        if(chart !== undefined)
        {
            chart.data = {
                        labels: chartData.times,
                        datasets: chartData.data 
                    };
            chart.update();
            console.log("updated", chartData);
        }
    }

    $: chartData, updateGraph();

</script>

<div style="background: white; padding:0.5em; border-radius: 5px; height: 25vh; width: 33vw;">
    <canvas bind:this={chartCanvas}></canvas>
</div>
