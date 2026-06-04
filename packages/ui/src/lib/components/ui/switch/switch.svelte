<script lang="ts">
	import { Switch as SwitchPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils/cn.js";

	let {
		ref = $bindable(null),
		class: className,
		checked = $bindable(false),
		size = "default",
		...restProps
	}: WithoutChildrenOrChild<SwitchPrimitive.RootProps> & {
		size?: "sm" | "default";
	} = $props();
</script>

<!--
	Note: bits-ui exposes state via `data-state="checked|unchecked"` — always use the
	explicit `data-[state=…]` variant form here (bare `data-checked:` matches attribute
	presence and never fires).
	Sized for industrial touchscreens: default 44×24px.
-->
<SwitchPrimitive.Root
	bind:ref
	bind:checked
	data-slot="switch"
	data-size={size}
	class={cn(
		"peer group/switch relative inline-flex shrink-0 items-center rounded-full border-2 border-transparent outline-none transition-all",
		"data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:bg-indigo-400",
		"data-[state=unchecked]:bg-zinc-300 dark:data-[state=unchecked]:bg-zinc-600",
		"focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
		"aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
		"data-[size=default]:h-6 data-[size=default]:w-11 data-[size=sm]:h-5 data-[size=sm]:w-9",
		"after:absolute after:-inset-x-3 after:-inset-y-2",
		"data-disabled:cursor-not-allowed data-disabled:opacity-60",
		className,
	)}
	{...restProps}
>
	<SwitchPrimitive.Thumb
		data-slot="switch-thumb"
		class={cn(
			"pointer-events-none block rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform",
			"group-data-[size=default]/switch:size-5 group-data-[size=sm]/switch:size-4",
			"data-[state=unchecked]:translate-x-0",
			"group-data-[size=default]/switch:data-[state=checked]:translate-x-5 group-data-[size=sm]/switch:data-[state=checked]:translate-x-4",
			"rtl:data-[state=checked]:-translate-x-5",
		)}
	/>
</SwitchPrimitive.Root>
