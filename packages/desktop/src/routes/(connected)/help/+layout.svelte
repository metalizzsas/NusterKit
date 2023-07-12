<script lang="ts">
	import { page } from "$app/stores";


	import Wrapper from "$lib/components/Wrapper.svelte";
	import Button from "$lib/components/buttons/Button.svelte";
	import Flex from "$lib/components/layout/flex.svelte";
import { _ } from "svelte-i18n";

</script>

<Wrapper class="mb-6">
    <Flex justify="between">
        <div>
            <h1>{$_('help.unselected.lead')}</h1>
            <p>{$_('help.unselected.sub')}</p>
        </div>

        {#if $page.route.id !== "/(connected)/help"}
            <a href="/help">
                <Button class="mt-4" size="small" ringColor="ring-slate-500" color="hover:bg-slate-500">Retour a l'accueil</Button>
            </a>
        {/if}
    </Flex>

</Wrapper>

<slot />