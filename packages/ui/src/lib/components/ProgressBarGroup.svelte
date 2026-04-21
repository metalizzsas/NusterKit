<script lang="ts">
	import ProgressBar from "./ProgressBar.svelte";

    let { progresses, showProgressLabelForIndex }: {
        progresses: Array<number | null>;
        showProgressLabelForIndex: number;
    } = $props();
</script>

<div class="relative">
    <div class="flex gap-4 items-center">
        {#each progresses as progress, index}
            <ProgressBar {progress} showProgressLabel={showProgressLabelForIndex === index} />
        {/each}
    </div>
</div>
