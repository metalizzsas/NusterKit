<script lang="ts">
	import { _ } from 'svelte-i18n';
	import '$lib/app.css';
	import { machineData } from '$lib/utils/store';
	import { useNavContainer } from '$lib/utils/navstack';
	import { onDestroy, onMount } from 'svelte';
	import Classic from '$lib/components/indexLayouts/classic.svelte';
	import Simplifyed from '$lib/components/indexLayouts/simplifyed.svelte';
	import { layoutSimplified } from '$lib/utils/settings';

	$useNavContainer = false;

	onDestroy(() => ($useNavContainer = true));

	onMount(() => {
		if ($machineData.machine.model == 'uscleaner') $layoutSimplified = true;
		else $layoutSimplified = false;
	});
</script>

{#if $layoutSimplified}
	<Simplifyed />
{:else}
	<Classic />
{/if}
