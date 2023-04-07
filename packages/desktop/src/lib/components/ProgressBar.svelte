<script lang="ts">

    import { tweened } from "svelte/motion";
    import { cubicOut } from 'svelte/easing';

    export let progress: number;

    export let dots: number | undefined = undefined;

    let springProgress = tweened(0, {
		duration: 500,
		easing: cubicOut
	});

    $: springProgress.set(progress);

</script>

<div class="bg-zinc-600/50 h-1.5 rounded-full grow relative">

    {#if dots}
        {#each Array.from(Array(dots).keys()) as dot}
            <div 
                class="h-1.5 w-1.5 absolute top-0 bg-white/50 rounded-full z-10" 
                style:left="{(1 / dots) * 100 + (dot / dots) * 100}%"
                class:invisible={(dot + 2 > dots)}
                style:transform={"translateX(-50%)"}
            />
        {/each}
    {/if}
    <div 
        class="h-1.5 rounded-full z-20 bg-indigo-500"
        style:width={`${$springProgress * 100}%`}
    />
</div>