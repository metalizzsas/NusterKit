<script lang="ts">

    import { tweened } from "svelte/motion";
    import { cubicInOut, cubicOut} from 'svelte/easing';

    export let progress: number;

    export let showNumbers = false;

    export let dots: number | undefined = undefined;
    
    let springProgress = tweened(0, {
		duration: 500,
		easing: cubicOut
	});

    let indefiniteProgress = tweened(0, {
		duration: 1500,
		easing: cubicInOut
	});

    $: if (progress === -1) {
        setInterval(() => {
            void indefiniteProgress.set(0.5);
        }, 1500);
        setInterval(() => {
            void indefiniteProgress.set(1);
        }, 3000);
        setInterval(() => {
            void indefiniteProgress.set(0);
        }, 4500);
    }
    
    $: void springProgress.set(progress);

</script>

<div class="bg-zinc-600/50 h-1.5 rounded-full grow relative" class:mt-4={showNumbers}>

    {#if showNumbers}
        <span class="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-indigo-500 rounded-full py-0.5 px-3 text-xs text-white font-medium">{Math.floor(progress * 100)} %</span>
    {/if}

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
    {#if progress !== -1}
        <div 
            class="h-1.5 rounded-full z-20 bg-indigo-500"
            style:width={`${$springProgress * 100}%`}
        />
    {:else}
        <div
            class="h-1.5 rounded-full z-20 bg-violet-500 animate-pulse"
            style:max-width="{($indefiniteProgress + 1) * 5}%"
            style:margin-left="{$indefiniteProgress * 90}%"
            style:margin-right="{-$indefiniteProgress * 90}%"
        />
    {/if}
</div>