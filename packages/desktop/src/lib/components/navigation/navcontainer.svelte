<script lang="ts">
	export let style = true;

	/**
	 * @deprecated
	 * use class instead
	 */
	export let classes = '';
</script>

<div
	class="{style
		? 'mt-6 bg-neutral-300 text-zinc-800 dark:bg-neutral-800 dark:text-white rounded-xl p-3'
		: ''} {classes} {$$props.class}"
>
	<slot />
</div>
