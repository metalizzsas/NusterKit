<script lang="ts">
	import Wrapper from "$lib/components/Wrapper.svelte";
	import SvelteMarkdown from "svelte-markdown";
	import HelpImageParser from "../HelpImageParser.svelte";
	import HelpLinkParser from "../HelpLinkParser.svelte";
	import type { PageData } from "./$types";

    export let data: PageData;

</script>

<Wrapper class="markdown">
    <SvelteMarkdown source={data.content} renderers={{ image: HelpImageParser, link: HelpLinkParser }}/>
</Wrapper>