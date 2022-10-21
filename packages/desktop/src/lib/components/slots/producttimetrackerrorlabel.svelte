<script lang="ts">
    import Label from "../label.svelte";
    import Flex from "../layout/flex.svelte";
    import Producttimetrackerrormodal from "./producttimetrackerrormodal.svelte";

    import { _ } from "svelte-i18n";

    let modalShown = false;

</script>

<Label class="ml-auto" on:click={() => modalShown = true}>
    <Flex items="center" gap={2}>
        <svg id="glyphicons-basic" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="h-4 fill-orange-500 animate-pulse">
            <path id="triangle-empty-alert" d="M30.30371,25.75879l-12.5-22a1.49938,1.49938,0,0,0-2.60742,0l-12.5,22A1.49934,1.49934,0,0,0,4,28H29a1.49934,1.49934,0,0,0,1.30371-2.24121ZM6.57715,25,16.5,7.53613,26.42285,25ZM18,22v1a1,1,0,0,1-1,1H16a1,1,0,0,1-1-1V22a1,1,0,0,1,1-1h1A1,1,0,0,1,18,22Zm-2-9h1a1,1,0,0,1,1,1v3l-.62756,2.58594A.50024.50024,0,0,1,16.87988,20h-.75976a.50024.50024,0,0,1-.49256-.41406L15,17V14A1,1,0,0,1,16,13Z"/>
        </svg>								  
        <span class="font-medium">{$_("timeTrackError.label")}</span>
    </Flex>
</Label>

<Producttimetrackerrormodal bind:shown={modalShown} />