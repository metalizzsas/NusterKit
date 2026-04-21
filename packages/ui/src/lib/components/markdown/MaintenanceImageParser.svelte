<script lang="ts">
	import Flex from "$lib/components/layout/flex.svelte";
	import { ArrowsPointingIn, ArrowsPointingOut } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { page } from "$app/stores";

    let { href = '', title = undefined, text = '' }: {
        href?: string;
        title?: string;
        text?: string;
    } = $props();

    let expanded = $state(false);
</script>

<Flex direction="row" items="center" justify="center">
    <div style:max-width={expanded ? '100%' : '66%'} class="relative duration-300">
        <img
            src={`/files/docs/maintenance-${$page.params.id}/${href}`}
            {title}
            alt={text}
            class="my-1 border-[1px] border-indigo-500/50 rounded-md mx-auto duration-300"
        >
        <button onclick={() => expanded = !expanded} class="absolute bottom-6 right-6" name="Expand image">
            <Icon src={!expanded ? ArrowsPointingOut : ArrowsPointingIn} class="h-8 w-8 text-zinc-800 bg-white rounded-md p-1 border border-zinc-500" />
        </button>
    </div>
</Flex>
