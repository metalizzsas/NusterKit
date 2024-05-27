<script lang="ts">
	import { XMark } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { createEventDispatcher } from "svelte";
	import Portal from "svelte-portal";
	import { fade } from "svelte/transition";

    const dispatch = createEventDispatcher<{ close: void }>();

    export let title: string;
</script>

<Portal target="body">
    <div class="absolute inset-0 backdrop-blur-sm z-40" in:fade={{ duration: 100 }} out:fade={{ duration: 100 }} />

    <div class="absolute inset-0 flex items-center justify-center z-50" in:fade={{ duration: 100 }} out:fade={{ duration: 100 }}>
        <div class="relative z-50 bg-zinc-900 w-1/3 max-h-[66%] overflow-scroll p-6 rounded-md ring-1 ring-indigo-300/50 text-white">
            
            <div class="flex justify-between items-start">
                <h1>{title}</h1>
                <button on:click={() => dispatch("close")}>
                    <Icon src={XMark} class="h-5 w-5 text-red-500" />
                </button>
            </div>
            <div class="bg-zinc-500/25 h-[1px] w-full mb-2" />

            <slot />
        </div>
    </div>
</Portal>