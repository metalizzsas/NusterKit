<script lang="ts">
	import '$lib/app.css';
	import { Router, Route, Link } from 'svelte-navigator';
	import { onMount } from 'svelte';

	import { machineData } from '$lib/utils/store';
	import Profiles from '$lib/nuster/profiles/Profiles.svelte';
	import Profile from '$lib/nuster/profiles/Profile.svelte';
	import MachineMain from '$lib/nuster/MachineMain.svelte';

	onMount(() => {
		const ws = new WebSocket('ws://127.0.0.1/v1');

		ws.onmessage = (event) => {
			$machineData = JSON.parse(event.data);
			console.log($machineData);
		};
	});
</script>

<Router>
	<main>
		<Route component={MachineMain} />

		<Route path="/profiles/" component={Profiles} />
		<Route path="/profile/*id" component={Profile} />
		<!-- <Route path="Gates" componenent={Gates}></Route> -->
	</main>
</Router>
