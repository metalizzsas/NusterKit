<script lang="ts">
	export let underline = true;
	export let margin = true;
</script>

<div class={margin ? 'mb-3 ml-1' : 'ml-1'}>
	<span class="text-base font-semibold text-zinc-600 dark:text-neutral-200">
		<slot />
	</span>
	{#if underline}
		<div class="h-[1px] w-1/12 bg-gray-400/50 dark:bg-gray-200/50 mt-1" />
	{/if}
</div>
