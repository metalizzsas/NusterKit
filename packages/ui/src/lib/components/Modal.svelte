<script lang="ts">
	import { XMark } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";
	import type { Snippet } from "svelte";
	import Portal from "svelte-portal";
	import { fade } from "svelte/transition";

    let {
        title,
        onclose,
        children,
    }: {
        title: string;
        onclose?: () => void;
        children?: Snippet;
    } = $props();
</script>

<Portal target="body">
    <div class="absolute inset-0 backdrop-blur-sm z-40" in:fade={{ duration: 100 }} out:fade={{ duration: 100 }} />

    <div class="absolute inset-0 flex items-center justify-center z-50" in:fade={{ duration: 100 }} out:fade={{ duration: 100 }}>
        <div class="relative z-50 bg-zinc-900 w-1/3 max-h-[66%] overflow-scroll p-6 rounded-md ring-1 ring-indigo-300/50 text-white">

            <div class="flex justify-between items-start">
                <h1>{title}</h1>
                <button onclick={() => onclose?.()}>
                    <Icon src={XMark} class="h-5 w-5 text-red-500" />
                </button>
            </div>
            <div class="bg-zinc-500/25 h-[1px] w-full mb-2" />

            {@render children?.()}
        </div>
    </div>
</Portal>
