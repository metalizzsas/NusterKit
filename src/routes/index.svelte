<script lang="ts">
	/**
	 * Here we redirect users if they use a bundled version of NuserDesktop or a standalone version
	 * If they use a bundled version we automaticaly reidrect them to the main page
	 * Otherwise we display the machine list selection
	 */
	import { goto } from '$app/navigation';
	import { beforeUpdate } from 'svelte';
	import { BUNDLED } from '$lib/bundle';
	import { browser } from '$app/env';

	beforeUpdate(async () => {
		if (browser) {
			if (BUNDLED == 'true') {
				localStorage.setItem('ip', window.location.host);
				goto('/app');
			} else {
				goto('/list');
			}
		}
	});
</script>
