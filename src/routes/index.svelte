<script lang="ts">
	import '$lib/app.css';
	import { onMount } from 'svelte';
	import { machineData } from '$lib/utils/store';

	onMount(() => {
		const ws = new WebSocket('ws://127.0.0.1/v1');

		ws.onmessage = (event) => {
			$machineData = JSON.parse(event.data);
			console.log($machineData);
		};
	});
</script>

<main>Main page</main>
