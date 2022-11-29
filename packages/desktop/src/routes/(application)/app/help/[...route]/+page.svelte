<script lang="ts">
	import type { PageData } from "./$types";
	import SvelteMarkdown from "svelte-markdown";
	import LinkParserHelp from "$lib/components/markdown/linkParserHelp.svelte";
	import ImageParser from "$lib/components/markdown/imageParser.svelte";
	import Navcontainer from "$lib/components/navigation/navcontainer.svelte";
	import { onDestroy, onMount } from "svelte";
	import Navtitle from "$lib/components/navigation/navstack/navtitle.svelte";

    export let data: PageData;

	onMount(() => {
		document.body.classList.add("bg-zinc-600");
	})

	onDestroy(() => {
		document.body.classList.remove("bg-zinc-600")
	})

</script>

<Navtitle title={["Help Center"]} />

<Navcontainer style={false} class="bg-white p-3 rounded-xl">
	<div class="prose prose-indigo max-w-[100%]">
		<SvelteMarkdown source={data.markdown} renderers={{"link": LinkParserHelp, "image": ImageParser}}/>
	</div>
</Navcontainer>