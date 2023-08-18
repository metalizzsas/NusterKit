<script lang="ts">
	import type { TailwindColors } from "$lib/utils/types/colors";

    export let color: TailwindColors<"bg", true> = "hover:bg-emerald-500";
    export let ringColor: TailwindColors<"ring", false> = "ring-emerald-500"
    export let textColor: TailwindColors<"text", false> = "text-zinc-800 dark:text-white";
    export let textHoverColor: TailwindColors<"text", true> = "hover:text-white dark:hover:text-white";

    export let disabled = false;

    export let size: "base" | "small" = "base";

    const sizes = {
        "base" : "ring-2 text-md font-semibold py-2 px-4 rounded-md",
        "small": "ring-2 text-base font-medium py-1 px-2 rounded-md"
    };

    let classData = $$props.class as string;

</script>

<button class="duration-200 ring-inset {sizes[size]} {ringColor} {color} {textColor} {textHoverColor} {classData}" class:grayscale={disabled} {disabled} on:click>
    <slot />
</button>