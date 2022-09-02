<script lang="ts">
	import Navcontainer from '../navigation/navcontainer.svelte';
	import Navcontainertitle from '../navigation/navcontainertitle.svelte';
	import Passive from './passive.svelte';

	import { _ } from 'svelte-i18n';
	import { machineData } from '$lib/utils/stores/store';

	export let inline = false;
</script>

{#if $machineData.passives.length > 0}
	<Navcontainer class="mb-auto">
		<Navcontainertitle>{$_('passives.list')}</Navcontainertitle>
		<div class={'grid gap-3 ' + (!inline ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2')}>
			{#each $machineData.passives as p}
				<Passive bind:passive={p} />
			{/each}
		</div>
	</Navcontainer>
{/if}
