<script lang="ts">
	import Actionmodal from '$lib/components/modals/actionmodal.svelte';
	import Navcontainersubtitle from '$lib/components/navigation/navcontainersubtitle.svelte';
	import ProfileRow from '$lib/components/profile/profileRow.svelte';
	import type { IProfileMapped } from '$lib/utils/interfaces';
	import Toggle from '$lib/components/userInputs/toggle.svelte';
	import { _ } from 'svelte-i18n';
	import Label from '$lib/components/label.svelte';

	export let shown: boolean;
	export let profile: IProfileMapped;
</script>

<Actionmodal bind:shown>
	<h3 class="leading-6 font-semibold">Profile values</h3>
	<div class="flex flex-col gap-2">
		{#each Object.keys(profile.values) as key}
			<Label>{key} — {profile.values[key]}</Label>
		{/each}
	</div>
</Actionmodal>
