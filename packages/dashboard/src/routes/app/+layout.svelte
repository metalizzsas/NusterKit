<script lang="ts">

    import { page } from "$app/stores";
    import { ListBullet, BuildingLibrary } from "@steeze-ui/heroicons"
    import NavLink from "$lib/components/NavLink.svelte";
    import Button from "$lib/components/Button.svelte";

</script>

<div class="flex">

    <nav class="min-w-[10%] max-w-[16.67%] bg-zinc-900 border-r border-indigo-500/50 flex flex-col h-screen">
        <div class="border-b border-indigo-500/50 px-4 pt-1">
            <h1 class="font-medium">
                <img src="/icons/icon-t-192.png" alt="nuster-logo" class="inline-block h-12 mr-1 mb-1.5"/>
                Nuster Dashboard
            </h1>
        </div>

        <div class="grow bg-zinc-800/25 flex flex-col gap-2 p-4">
            <NavLink href="/app/machines" content="Machines" icon={ListBullet} />
            <NavLink href="/app/organization" content="Organisation" icon={BuildingLibrary} />
        </div>

        <div class="border-t border-indigo-500/50 p-4">
            <div class="flex flex-row gap-4">
                <div>
                    <p class="capitalize">{$page.data.user?.username}</p>
                    <p class="text-sm text-zinc-300">{$page.data.user?.expand.organization.name}</p>
                </div>
                <a href="/logout" class="mt-1 block" data-sveltekit-preload-data="off">
                    <Button role="danger" size="small">Se déconnecter</Button>
                </a>
            </div>
        </div>
    </nav>

    <div class="grow h-screen overflow-y-scroll p-6">
        <slot />
    </div>
</div>



