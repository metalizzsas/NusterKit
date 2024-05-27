<script lang="ts">
	import { page } from "$app/stores";
	import Wrapper from "$lib/components/Wrapper.svelte";
	import Button from "$lib/components/buttons/Button.svelte";
	import Flex from "$lib/components/layout/flex.svelte";
	import { ArrowLeft } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";
    import { _ } from "svelte-i18n";
</script>

<Wrapper class="mb-6" padding="p-4">
    <Flex justify="between">
        <div>
            <h1>{$_('help.unselected.lead')}</h1>
            <p>{$_('help.unselected.sub')}</p>
        </div>

        {#if $page.route.id !== "/(connected)/help"}
            <a href="/help">
                <Button class="mt-4" size="small" ringColor="ring-amber-500" color="hover:bg-amber-500">
                    <Icon src={ArrowLeft} class="inline-block h-5 w-5 mr-1 mb-0.5" />
                    {$_('back')}
                </Button>
            </a>
        {/if}
    </Flex>

</Wrapper>

<slot />