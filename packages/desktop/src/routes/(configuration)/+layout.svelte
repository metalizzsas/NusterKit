<script lang="ts">

    import { BUNDLED } from '$lib/utils/bundle';
    import Flex from '$lib/components/layout/flex.svelte';

</script>
<div class="bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl ring-[0.5px] ring-indigo-300/50 mb-6 text-white">
    <Flex gap={6} align="middle" items="center" class="p-4 overflow-hidden">
        <a
            href={(BUNDLED == 'true' ? '/app' : '/')}
            class="flex flex-rox gap-4 items-center hover:bg-white rounded-md hover:text-zinc-700 text-white transition-all duration-500 cursor-pointer"
        >
            <img
                src="/icons/pwa-192.png"
                alt="logo nuster"
                class="w-8 h-8 shadow-sm rounded-md hover:rotate-[2deg] transition-all duration-500"
            />
            <span class="inline-block font-bold text-lg pr-3">Nuster</span>
        </a>
    </Flex>
</div>

<slot></slot>