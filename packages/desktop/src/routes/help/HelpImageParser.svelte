<script lang="ts">
	import { lang } from "$lib/utils/stores/settings";

    export let href = '';
    export let title: string | undefined = undefined;
    export let text = '';
</script>

<img 
    src={`help/${$lang}/${href}`} 
    {title} 
    alt={text} 
    class="my-1 border-[1px] border-indigo-500/50 rounded-md max-w-[66%] mx-auto"
>