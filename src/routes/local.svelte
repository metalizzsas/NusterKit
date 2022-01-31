<script lang="ts">
	import { goto } from '$app/navigation';

	import { Linker } from '$lib/utils/linker';
	import { beforeUpdate } from 'svelte';
	beforeUpdate(() => {
		$Linker = '127.0.0.1';
		goto('/app');
	});
</script>
