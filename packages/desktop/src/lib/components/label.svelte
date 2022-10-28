<script lang="ts">
	type sizes = 'small' | 'base' | "tiny";

	export let size: sizes = 'base';
	export let color = 'dark:bg-white dark:text-zinc-800 bg-zinc-800 text-white';
	
	const sizesArray: Record<sizes, string> = {
		"base": "py-1 px-3 text-base",
		"small": "py-0.5 px-1.5 text-sm",
		"tiny": "py-0.25 px-1 text-xs"
	}
</script>

<span class="{sizesArray[size]} rounded-full {$$props.class || ''} {color}" on:click><slot /></span>
