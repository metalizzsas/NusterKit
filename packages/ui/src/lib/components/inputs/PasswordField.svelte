<script lang="ts">
	import { page } from "$app/stores";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { Eye, EyeSlash } from "@steeze-ui/heroicons";
	import { Input } from "$lib/components/ui/input/index.js";
	import { cn } from "$lib/utils/cn.js";
	import Keyboard from "../Keyboard.svelte";

	let {
		value = $bindable(),
		disabled = false,
		secretShown = $bindable(false),
		placeholder = undefined,
		name = undefined,
		keyboardEmbedded = false,
		class: class_name = "",
	}: {
		value: string;
		disabled?: boolean;
		secretShown?: boolean;
		placeholder?: string;
		name?: string;
		keyboardEmbedded?: boolean;
		class?: string;
	} = $props();

	let passwordElement: HTMLInputElement | undefined = $state();

	let focused = $state(false);

	$effect(() => {
		if (passwordElement) {
			passwordElement.type = secretShown ? "text" : "password";
		}
	});
	$effect(() => {
		if (secretShown) {
			setTimeout(() => (secretShown = false), 3000);
		}
	});
</script>

<div class={cn("relative flex items-center", class_name)}>
	<Input
		ref={passwordElement}
		{name}
		type="password"
		{placeholder}
		bind:value
		{disabled}
		autocomplete="off"
		class="h-11 border-border bg-white pr-11 text-base shadow-xs dark:bg-zinc-800"
		onfocus={() => (focused = true)}
	/>
	<button
		class="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center"
		aria-label={secretShown ? "Hide password" : "Show password"}
		onclick={(e) => {
			e.preventDefault();
			secretShown = !secretShown;
			if (focused) passwordElement?.focus();
			if (passwordElement) passwordElement.selectionStart = value.length;
		}}
	>
		<Icon src={secretShown ? Eye : EyeSlash} class="h-5 w-5" />
	</button>
</div>

{#if !keyboardEmbedded && focused && $page.data.is_machine_screen}
	<Keyboard
		bind:value
		isPassword={true}
		bind:isPasswordShown={secretShown}
		onclose={() => (focused = false)}
	/>
{/if}
