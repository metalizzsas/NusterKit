<script>
    export let href = ''
    export let title = undefined
    export let text = ''
</script>

<img src={"/help/" + href} {title} alt={text} class="my-1 border-[1px] border-indigo-500/50 rounded-md max-w-[75%] mx-auto">