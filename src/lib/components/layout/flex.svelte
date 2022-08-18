<script lang="ts">
	export let direction: 'row' | 'col' = 'row';
	export let gap: number = 4;
</script>

<div class="flex flex-{direction} gap-{gap} {$$props.class}">
	<slot />
</div>
