<script lang="ts">
	export let color: string = 'bg-white text-zinc-800';
</script>

<span class="py-1 px-3 rounded-full {color} {$$props.class}" on:click><slot /></span>
