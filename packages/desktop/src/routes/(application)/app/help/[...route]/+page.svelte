<script lang="ts">
	import type { PageData } from "./$types";
	import { navTitle, useNavContainer, navActions } from "$lib/utils/stores/navstack";
	import SvelteMarkdown from "svelte-markdown";
	import LinkParserHelp from "$lib/components/markdown/linkParserHelp.svelte";
	import ImageParser from "$lib/components/markdown/imageParser.svelte";
	import Navcontainer from "$lib/components/navigation/navcontainer.svelte";
	import { onDestroy, onMount } from "svelte";

    export let data: PageData;

	$navTitle = ["Help Center"];
	$navActions = [];
	$useNavContainer = false;
	
	onMount(() => {
		document.body.classList.add("bg-zinc-600");
	})

	onDestroy(() => {
		document.body.classList.remove("bg-zinc-600")
	})

</script>

<Navcontainer style={false} class="bg-white p-3 rounded-xl">
	<div class="prose prose-indigo max-w-[100%]">
		<SvelteMarkdown source={data.markdown} renderers={{"link": LinkParserHelp, "image": ImageParser}}/>
	</div>
</Navcontainer>