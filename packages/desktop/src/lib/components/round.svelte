<script lang="ts">
	export let size: number;
	export let margin = 0;
	export let color: string;
	export let shadowColor: string | undefined = undefined;
</script>

<div
	class="rounded-full h-{size} w-{size} m-{margin} bg-{color} {shadowColor !== undefined
		? 'shadow-md shadow-' + shadowColor
		: ''} "
/>
