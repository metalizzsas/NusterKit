<script lang="ts">
	import Wrapper from "$lib/components/Wrapper.svelte";
	import SvelteMarkdown from "svelte-markdown";
	import HelpImageParser from "$lib/components/markdown/HelpImageParser.svelte";
	import HelpLinkParser from "$lib/components/markdown/HelpLinkParser.svelte";
	import type { PageData } from "./$types";

    export let data: PageData;

</script>

<Wrapper class="markdown">
    <SvelteMarkdown source={data.content} renderers={{ image: HelpImageParser, link: HelpLinkParser }}/>
</Wrapper>