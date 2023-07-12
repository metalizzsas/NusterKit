<script lang="ts">
	import Wrapper from "$lib/components/Wrapper.svelte";
	import SvelteMarkdown from "svelte-markdown";
	import { browser } from "$app/environment";
	import { page } from "$app/stores";
	import HelpImageParser from "../HelpImageParser.svelte";
	import HelpLinkParser from "../HelpLinkParser.svelte";
	import { afterUpdate } from "svelte";

    let content: string | undefined = undefined;

    let scrollY: number;

    afterUpdate(() => {
        if(browser)
        {
            fetch(`/documentation/${$page.params.helpFile}`)
                .then(res => res.text())
                .then(text => { content = text; scrollY = 0; })
                .catch(() => content = undefined);
        }
    });

</script>

<svelte:window bind:scrollY={scrollY} />

<Wrapper class="markdown">
    <SvelteMarkdown source={content} renderers={{ image: HelpImageParser, link: HelpLinkParser }}/>
</Wrapper>