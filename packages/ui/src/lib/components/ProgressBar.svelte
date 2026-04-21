<script lang="ts">
    import { tweened } from "svelte/motion";
    import { cubicOut } from 'svelte/easing';

    let { progress, showProgressLabel = false }: {
        progress: number | null;
        showProgressLabel?: boolean;
    } = $props();

    let springProgress = tweened(0, {
		duration: 500,
		easing: cubicOut
	});

    $effect(() => {
        springProgress.set(progress ?? 1);
    });
</script>

<div class="bg-zinc-600/50 h-1.5 rounded-full grow relative" class:my-2={showProgressLabel}>
    {#if showProgressLabel}
        <span
            class:bg-indigo-500={progress !== null}
            class:bg-violet-500={progress === null}
            class="absolute z-10 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 rounded-full py-0.5 px-3 text-xs text-white font-medium"
        >
            {#if progress === null}
                — %
            {:else}
                {Math.floor((progress ?? 1) * 100)} %
            {/if}
        </span>
    {/if}
    <div
        class="h-1.5 rounded-full z-20"
        class:bg-indigo-500={progress !== null}
        class:bg-violet-500={progress === null}
        class:animate-pulse={progress === null}
        style:width={`${$springProgress * 100}%`}
    />
</div>
