<script lang="ts">

    export let padding: `p-${number}` = "p-6";
    export let variant: "default" | "muted" = "default";

    const variantStyles = {
        default: "bg-white dark:bg-zinc-800",
        muted: "bg-gray-100 dark:bg-zinc-700",
    } as const;

</script>

<div class="{variantStyles[variant]} text-zinc-800 dark:text-white rounded-xl {padding} border border-indigo-400/50 dark:border-indigo-400/25 {$$props.class}">
    <slot />
</div>