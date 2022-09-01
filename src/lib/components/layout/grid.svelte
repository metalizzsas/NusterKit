<script lang="ts">
	export let cols: number = 1;
	export let gap: number = 4;
</script>

<div class="grid grid-cols-{cols} gap-{gap} {$$props.class}">
	<slot />
</div>
