<script lang="ts">

    export let size: "small" | "normal" = "normal";
    export let role: "primary" | "secondary" | "warning" | "danger" | "success" = "primary";

    const sizes: Record<typeof size, string> = {
        "normal": "p-2 border-2 font-semibold",
        "small": "py-1 px-1.5 border-1 font-medium"
    };

    const roles: Record<typeof role, string> = {
        "primary": "border-indigo-500 hover:bg-indigo-500",
        "secondary": "border-gray-500 hover:bg-gray-500",
        "danger": "border-red-500 hover:bg-red-500",
        "warning": "border-amber-500 hover:bg-amber-500",
        "success": "border-emerald-500 hover:bg-emerald-500"
    };

</script>

<button class="rounded-md duration-200 {sizes[size]} {roles[role]}" on:click>
    <slot />
</button>