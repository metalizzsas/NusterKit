<script lang="ts">

	import ProgressBar from "./ProgressBar.svelte";

    export let progresses: Array<number | null>;
    export let showProgressLabelForIndex;

</script>

<div class="relative">
    <div class="flex gap-4 items-center">
        {#each progresses as progress, index}
            <ProgressBar progress={progress} showProgressLabel={showProgressLabelForIndex === index} />
        {/each}
    </div>
</div>