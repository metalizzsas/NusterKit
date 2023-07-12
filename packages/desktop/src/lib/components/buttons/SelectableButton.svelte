<script lang="ts">

    export let selected = false;

</script>

<button
    class="hover:rounded-lg duration-300 py-2 px-4"
    
    class:hover:bg-zinc-100={!selected}
    class:dark:hover:bg-zinc-700={!selected}
    
    class:rounded-lg={selected}
    class:bg-zinc-200={selected}
    class:dark:bg-zinc-500={selected}
    class:hover:bg-zinc-300={selected}
    class:dark:hover:bg-zinc-600={selected}

    on:click
>
    <slot />
</button>