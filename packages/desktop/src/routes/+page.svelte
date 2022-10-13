<script lang="ts">
	/**
	 * Here we redirect users if they use a bundled version of NuserDesktop or a standalone version
	 * If they use a bundled version we automaticaly reidrect them to the main page
	 * Otherwise we display the machine list selection
	 */
	import { goto } from '$app/navigation';
	import { beforeUpdate } from 'svelte';
	import { BUNDLED } from '$lib/bundle';

	beforeUpdate(() => {
		if (BUNDLED == 'true') {
			localStorage.setItem('ip', window.location.host);
			void goto('/app');
		} else {
			void goto('/list');
		}
	});
</script>
