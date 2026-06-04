<script lang="ts">
	import { Switch as SwitchPrimitive } from "bits-ui";
	import { cn } from "$lib/utils/cn.js";
	import type { FormInput } from "./formInput";

	let {
		value = $bindable(),
		change = () => {},
		changeNum = () => {},
		locked = false,
		enableGrayScale = false,
		form = undefined,
	}: {
		value: number | boolean;
		change?: () => void;
		changeNum?: () => void;
		locked?: boolean;
		enableGrayScale?: boolean;
		form?: FormInput<"change">;
	} = $props();

	let validateButton: HTMLButtonElement | undefined = $state();

	let checked = $derived(typeof value === "boolean" ? value : typeof value === "undefined" ? false : value !== 0);

	const on_change = (next: boolean) => {
		if (locked) return;

		if (typeof value === "boolean") value = next;
		else value = next ? 1 : 0;

		change();
		changeNum();

		if (form?.validateOn === "change" && validateButton !== undefined) {
			setTimeout(() => validateButton?.click(), 10);
		}
	};
</script>

<!--
	State-semantic switch (industrial io / settings): emerald track when on,
	red track when off, white thumb. Same geometry as the shadcn Switch (44×24px).
	bits-ui exposes state via `data-state` — use explicit `data-[state=…]` variants.
-->
<SwitchPrimitive.Root
	{checked}
	disabled={locked}
	onCheckedChange={on_change}
	class={cn(
		"relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent outline-none transition-all",
		"data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-red-500/80",
		"focus-visible:ring-3 focus-visible:ring-ring/50",
		locked && "cursor-default opacity-80",
		locked && enableGrayScale && "grayscale",
	)}
>
	<SwitchPrimitive.Thumb
		class={cn(
			"pointer-events-none block size-5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform",
			"data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-5",
		)}
	/>
</SwitchPrimitive.Root>

{#if form !== undefined}
	<input
		type="hidden"
		name={form.name}
		value={typeof value === "boolean" ? (value ? 1 : 0) : value}
		form={form.formName}
	/>
	{#if form.validateOn !== undefined}
		<button type="submit" form={form.formName} class="hidden" bind:this={validateButton} aria-hidden="true"></button>
	{/if}
{/if}
