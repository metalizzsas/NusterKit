<script context="module" lang="ts">
	import '$lib/app.css';
	import type { ErrorLoad } from '@sveltejs/kit';
	export const load: ErrorLoad = (ctx) => {
		return {
			props: {
				title: `${ctx.status}: ${ctx.error?.message}`,
			},
		};
	};
</script>

<script lang="ts">
	export let title: string;
</script>

<main class="text-gray-800">
	<h1 class="text-xl">Failed to render this page</h1>
	<h2 class="text-sm">{title}</h2>

	<a
		href="/app"
		class="inline-block py-2 px-5 rounded-xl font-semibold bg-orange-500 text-white mt-3"
	>
		Return to main App
	</a>
</main>
