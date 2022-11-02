<script lang="ts">

    import Modal from "../modals/modalchoice.svelte";

    import { _ } from "svelte-i18n";

    export let shown: boolean;
</script>


<Modal bind:shown={shown} title={$_('timeTrackError.title')}>
    {$_('timeTrackError.body')}
</Modal>