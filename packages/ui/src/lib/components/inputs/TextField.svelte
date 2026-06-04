<script lang="ts">
	import { page } from "$app/stores";
	import { Input } from "$lib/components/ui/input/index.js";
	import { cn } from "$lib/utils/cn.js";
	import Keyboard from "../Keyboard.svelte";

	let {
		value = $bindable(),
		placeholder = undefined,
		disabled = false,
		keyboardEmbedded = false,
		class: class_name = "",
	}: {
		value: string;
		placeholder?: string;
		disabled?: boolean;
		keyboardEmbedded?: boolean;
		class?: string;
	} = $props();

	let focused = $state(false);
</script>

<Input
	type="text"
	bind:value
	{placeholder}
	{disabled}
	class={cn("h-11 border-border bg-white text-base shadow-xs dark:bg-zinc-800", class_name)}
	onfocus={() => {
		if (disabled === false) focused = true;
	}}
/>

{#if !keyboardEmbedded && focused && $page.data.is_machine_screen}
	<Keyboard bind:value onclose={() => (focused = false)} />
{/if}
