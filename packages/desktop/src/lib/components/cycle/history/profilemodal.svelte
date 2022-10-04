<script lang="ts">
	import Actionmodal from '$lib/components/modals/actionmodal.svelte';
	import Label from '$lib/components/label.svelte';

	import type { IProfileHydrated } from "@metalizzsas/nuster-typings/src/hydrated/profile";

	export let shown: boolean;
	export let profile: IProfileHydrated;
</script>

<Actionmodal bind:shown>
	<h3 class="leading-6 font-semibold">Profile values</h3>
	<div class="flex flex-col gap-2">
		{#each profile.values as field}
			<Label>{field.name} — {field.value}</Label>
		{/each}
	</div>
</Actionmodal>
