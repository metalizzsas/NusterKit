<script lang="ts">
	import Actionmodal from '$lib/components/modals/actionmodal.svelte';
	import { _ } from 'svelte-i18n';
	import Label from '$lib/components/label.svelte';

	import type { IProfileMappedHydrated } from "@metalizz/nuster-typings/src/hydrated/profile/index";

	export let shown: boolean;
	export let profile: IProfileMappedHydrated;
</script>

<Actionmodal bind:shown>
	<h3 class="leading-6 font-semibold">Profile values</h3>
	<div class="flex flex-col gap-2">
		{#each Object.keys(profile.values) as key}
			<Label>{key} — {profile.values[key]}</Label>
		{/each}
	</div>
</Actionmodal>
