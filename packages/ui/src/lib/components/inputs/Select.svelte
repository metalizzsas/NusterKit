<script lang="ts">
	import * as ShadSelect from "$lib/components/ui/select/index.js";
	import { cn } from "$lib/utils/cn.js";
	import type { FormInput } from "./formInput";

	let {
		value = $bindable(),
		selectableValues,
		style = undefined,
		disabled = false,
		change = () => {},
		form = undefined,
		class: class_name = "",
	}: {
		value: string | number | undefined;
		selectableValues: Array<{ name: string | number; value: string | number }>;
		style?: string;
		disabled?: boolean;
		change?: () => void;
		form?: FormInput<"change">;
		class?: string;
	} = $props();

	let validateButton: HTMLButtonElement | undefined = $state();

	const valueAsString = $derived(value === undefined ? undefined : String(value));

	const find_typed_value = (next: string | undefined) => {
		if (next === undefined) return undefined;
		const match = selectableValues.find((sv) => String(sv.value) === next);
		return match ? match.value : next;
	};

	const on_value_change = (next: string | undefined) => {
		value = find_typed_value(next);
		change();
		if (form?.validateOn === "change" && validateButton !== undefined) {
			setTimeout(() => validateButton?.click(), 10);
		}
	};

	const selected_label = $derived(
		selectableValues.find((sv) => String(sv.value) === valueAsString)?.name ?? "—",
	);
</script>

<ShadSelect.Root type="single" value={valueAsString} onValueChange={on_value_change} {disabled}>
	<ShadSelect.Trigger
		class={cn(
			"h-11 w-full border-border bg-white text-base shadow-xs transition-colors hover:border-indigo-400 dark:bg-zinc-800",
			style,
			class_name,
		)}
	>
		<span data-slot="select-value">{selected_label}</span>
	</ShadSelect.Trigger>
	<ShadSelect.Content>
		{#each selectableValues as sValue (sValue.value)}
			<ShadSelect.Item
				value={String(sValue.value)}
				label={String(sValue.name)}
				class="min-h-11 py-2 text-base"
			>
				{sValue.name}
			</ShadSelect.Item>
		{/each}
	</ShadSelect.Content>
</ShadSelect.Root>

{#if form !== undefined}
	<input type="hidden" name={form.name} bind:value form={form.formName} />
	{#if form.validateOn === "change"}
		<button type="submit" form={form.formName} class="hidden" bind:this={validateButton} aria-hidden="true"></button>
	{/if}
{/if}
