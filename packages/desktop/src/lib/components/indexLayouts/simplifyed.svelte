<script lang="ts">
	import Quickstart from '$lib/components/cycle/quickstart.svelte';
	import Maintenances from '../maintenance/maintenances.svelte';
	import Slotslist from '../slots/slotslist.svelte';
	import Grid from '../layout/grid.svelte';
	import Flex from '../layout/flex.svelte';
	import BaseMenu from '../baseMenu.svelte';
</script>

<Grid gap={6} cols={2} class="-mt-6">
	<Quickstart />
	<Flex direction="col" gap={6}>
		<Slotslist inline={true}/>
		<BaseMenu stacked={true} />
	</Flex>
</Grid>
<Maintenances />
