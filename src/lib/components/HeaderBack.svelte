<script lang="ts">
	import Back from '$lib/components/Back.svelte';

	export let title: string = 'default';
</script>

<div class="mb-5">
	<div class="flex flex-row justify-between items-center">
		<div class="flex flex-row justify-items-end gap-4 items-center">
			<Back />
			<h1 class="text-xl text-white bg-black py-1 px-3 rounded-full">{title}</h1>
		</div>
		<slot />
	</div>
</div>
