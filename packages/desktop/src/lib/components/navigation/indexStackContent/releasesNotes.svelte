<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';

	import { Linker } from '$lib/utils/stores/linker';

	import Modalcontent from '$lib/components/modals/modalcontent.svelte';
	import SvelteMarkdown from 'svelte-markdown';

	import LinkParser from '$lib/components/markdown/linkParser.svelte';

	export let shown: boolean;

	export let type: "desktop" | "turbine";

	let markdown = '';

	const urls: Map<("turbine" | "desktop"), string> = new Map();

	urls.set("turbine", `//${$Linker}/api/currentReleaseNotes`);
	urls.set("desktop", 'CHANGELOG.md');

	onMount(async () => {
		if(urls.has(type))
		{
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const markdownRequest = await fetch(urls.get(type)!);
			markdown = await markdownRequest.text();
		}
	});
</script>

<Modalcontent bind:shown title={$_('settings.updateNotes.main')}>
	<div class="markdown text-md">
		<SvelteMarkdown source={markdown} renderers={{"link": LinkParser}}/>
	</div>
</Modalcontent>
