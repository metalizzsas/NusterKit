<script lang="ts">
	import { page } from "$app/stores";
	import { MinusCircle, PlusCircle } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { Input } from "$lib/components/ui/input/index.js";
	import { cn } from "$lib/utils/cn.js";
	import Keyboard from "../Keyboard.svelte";

	let {
		value = $bindable(),
		change = () => {},
		disabled = false,
		keyboardEmbedded = false,
		min = undefined,
		max = undefined,
		step = undefined,
		name = undefined,
		validateOnChange = false,
		class: class_name = "",
	}: {
		value: number;
		change?: () => void;
		disabled?: boolean;
		keyboardEmbedded?: boolean;
		min?: number;
		max?: number;
		step?: number;
		name?: string;
		validateOnChange?: boolean;
		class?: string;
	} = $props();

	let focused = $state(false);

	let validateOnChangeButton: HTMLButtonElement | undefined = $state();

	const increment = () => {
		if (max !== undefined && value >= max) value = max;
		else value = step !== undefined ? value + step : value + 1;

		change();
		if (validateOnChange && validateOnChangeButton) validateOnChangeButton.click();
	};

	const decrement = () => {
		if (min !== undefined && value <= min) value = min;
		else value = step !== undefined ? value - step : value - 1;

		change();
		if (validateOnChange && validateOnChangeButton) validateOnChangeButton.click();
	};
</script>

<div class={cn("flex items-center gap-2", class_name)}>
	<Input
		type="number"
		bind:value
		{disabled}
		{min}
		{max}
		{step}
		{name}
		class="h-11 grow border-border bg-white text-base shadow-xs dark:bg-zinc-800"
		onfocus={() => (focused = true)}
		oninput={() => {
			if (max !== undefined && value > max) value = max;
			change();
			if (validateOnChange && validateOnChangeButton) validateOnChangeButton.click();
		}}
	/>
	{#if !disabled}
		<button
			onclick={decrement}
			aria-label="Decrement"
			class="grid h-11 w-11 place-items-center rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
		>
			<Icon src={MinusCircle} class="h-7 w-7 text-zinc-600 dark:text-white" {disabled} />
		</button>
		<button
			onclick={increment}
			aria-label="Increment"
			class="grid h-11 w-11 place-items-center rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
		>
			<Icon src={PlusCircle} class="h-7 w-7 text-zinc-600 dark:text-white" {disabled} />
		</button>
	{/if}
</div>

{#if validateOnChange}
	<button type="submit" class="hidden" bind:this={validateOnChangeButton} aria-hidden="true"></button>
{/if}

{#if !keyboardEmbedded && focused && $page.data.is_machine_screen}
	<Keyboard
		bind:value
		onclose={() => {
			focused = false;
			change();
		}}
	/>
{/if}
