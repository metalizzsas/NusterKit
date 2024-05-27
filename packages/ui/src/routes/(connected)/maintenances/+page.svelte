<script>
	import Wrapper from "$lib/components/Wrapper.svelte";
	import { _ } from "svelte-i18n";

	// TODO: Add modal if maintenance task is not found
</script>

<Wrapper>
	<h3>{$_('maintenance.unselected.lead')}</h3>
	<p>{$_('maintenance.unselected.sub')}</p>
</Wrapper>