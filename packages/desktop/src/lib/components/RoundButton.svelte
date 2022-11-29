<script lang="ts">
    export let color = "bg-white";
</script>

<button
    class="rounded-full {color} p-1 transition hover:rotate-180 duration-300"
    on:click
>
    <slot/>
</button>