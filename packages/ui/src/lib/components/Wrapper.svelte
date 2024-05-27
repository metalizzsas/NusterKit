<script lang="ts">

    export let padding: `p-${number}` = "p-6";

</script>

<div class="bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white rounded-xl {padding} border border-indigo-400/50 dark:border-indigo-400/25 {$$props.class}">
    <slot />
</div>