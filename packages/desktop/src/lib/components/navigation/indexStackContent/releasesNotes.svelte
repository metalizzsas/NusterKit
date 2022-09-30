<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';

	import { Linker } from '$lib/utils/stores/linker';

	import Modalcontent from '$lib/components/modals/modalcontent.svelte';
	import SvelteMarkdown from 'svelte-markdown';

	export let shown: boolean;

	let markdownReleaseNotes = '';
	let markdownReleaseNotesUI = '';

	onMount(async () => {
		const releaseNotesRequest = await fetch('//' + $Linker + '/api/currentReleaseNotes');
		const ndreleaseNotesRequest = await fetch('/release.md');

		markdownReleaseNotes = await releaseNotesRequest.text();
		markdownReleaseNotesUI = await ndreleaseNotesRequest.text();
	});
</script>

<Modalcontent bind:shown title={$_('settings.updateNotes.main')}>
	<div class="markdown grid grid-cols-1 md:grid-cols-2 text-md">
		<div>
			<h1>{$_('settings.updateNotes.firmware')}</h1>
			<SvelteMarkdown source={markdownReleaseNotes} />
		</div>
		<div>
			<h1>{$_('settings.updateNotes.ui')}</h1>
			<SvelteMarkdown source={markdownReleaseNotesUI} />
		</div>
	</div>
</Modalcontent>
