<script lang="ts">
	import type { TailwindColors } from "$lib/utils/types/colors";
	import type { Snippet } from "svelte";

    let {
        color = "hover:bg-emerald-500",
        ringColor = "ring-emerald-500",
        textColor = "text-zinc-800 dark:text-white",
        textHoverColor = "hover:text-white dark:hover:text-white",
        disabled = false,
        size = "base",
        class: class_name = "",
        children,
        onclick,
    }: {
        color?: TailwindColors<"bg", true>;
        ringColor?: TailwindColors<"ring", false>;
        textColor?: TailwindColors<"text", false>;
        textHoverColor?: TailwindColors<"text", true>;
        disabled?: boolean;
        size?: "base" | "small";
        class?: string;
        children?: Snippet;
        onclick?: (e: MouseEvent) => void;
    } = $props();

    const sizes = {
        "base" : "ring-2 text-md font-semibold py-2 px-4 rounded-md",
        "small": "ring-2 text-base font-medium py-1 px-2 rounded-md"
    };
</script>

<button class="duration-200 ring-inset {sizes[size]} {ringColor} {color} {textColor} {textHoverColor} {class_name}" class:grayscale={disabled} {disabled} {onclick}>
    {@render children?.()}
</button>
