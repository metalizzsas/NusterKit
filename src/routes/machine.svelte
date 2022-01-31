<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async (ctx) => {
		return { props: { machineIP: ctx.url.searchParams.get('ip') } };
	};
</script>

<script lang="ts">
	import { goto } from '$app/navigation';

	import { Linker } from '$lib/utils/linker';
	import { beforeUpdate } from 'svelte';

	export let machineIP: string;

	beforeUpdate(() => {
		$Linker = machineIP;
		goto('/app');
	});
</script>
