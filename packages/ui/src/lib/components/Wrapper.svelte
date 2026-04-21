<script lang="ts">
	import type { Snippet } from "svelte";

    let {
        padding = "p-6",
        variant = "default",
        class: class_name = "",
        children,
    }: {
        padding?: `p-${number}`;
        variant?: "default" | "muted";
        class?: string;
        children?: Snippet;
    } = $props();

    const variantStyles = {
        default: "bg-white dark:bg-zinc-800",
        muted: "bg-gray-100 dark:bg-zinc-700",
    } as const;
</script>

<div class="{variantStyles[variant]} text-zinc-800 dark:text-white rounded-xl {padding} border border-indigo-400/50 dark:border-indigo-400/25 {class_name}">
    {@render children?.()}
</div>
