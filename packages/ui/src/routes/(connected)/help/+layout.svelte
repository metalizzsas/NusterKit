<script lang="ts">
	import type { Snippet } from "svelte";
	import { page } from "$app/stores";
	import PageHeader from "$lib/components/PageHeader.svelte";
	import { _ } from "svelte-i18n";

	let { children }: { children: Snippet } = $props();

	let isSubRoute = $derived($page.route.id !== "/(connected)/help");
</script>

<PageHeader
	title={$_("help.lead")}
	subtitle={$_("help.unselected.sub")}
	back={isSubRoute ? "/help" : undefined}
/>

{@render children()}
