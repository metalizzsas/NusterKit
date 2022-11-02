<script lang="ts">
	import Label from '$lib/components/label.svelte';

	import type { IProfileHydrated } from "@metalizzsas/nuster-typings/build/hydrated/profile";
	import Modal from '$lib/components/modals/modal.svelte';

	export let shown: boolean;
	export let profile: IProfileHydrated;
</script>

<Modal bind:shown title={"profile details"}>
	<h3 class="leading-6 font-semibold">Profile values</h3>
	<div class="flex flex-col gap-2">
		{#each profile.values as field}
			<Label>{field.name} — {field.value}</Label>
		{/each}
	</div>
</Modal>