<script lang="ts">
	import '$lib/app.css';

	export let color: string = 'red-500';
	export let colorHover: string = 'red-400';
</script>

<button class="bg-{color} py-1 px-5 rounded-full text-white hover:bg-{colorHover}">
	<slot />
</button>
