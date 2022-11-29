<script lang="ts">
	export let color = 'bg-indigo-500';

	type buttonSize = 'tiny' | 'small' | 'base' | 'large' | 'big';
	const sizes: Map<buttonSize, string> = new Map([
		['tiny', 'py-0.5 px-2 text-sm'],
		['small', 'py-1 px-3 text-sm'],
		['base', 'py-1.5 px-4'],
		['large', 'py-2 px-5 text-lg'],
		['big', 'py-2.5 px-6 text-xl'],
	]);

	export let size: buttonSize = 'base';
</script>

<button
	class="{color} hover:{color + '/90'} {sizes.get(
		size,
	)} rounded-xl text-white font-semibold hover:scale-y-[1.025] duration-100 {$$props.class || ''}"
	on:click
>
	<slot />
</button>
