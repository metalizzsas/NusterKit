<script>
	import Wrapper from "$lib/components/Wrapper.svelte";
	import { _ } from "svelte-i18n";
</script>

<Wrapper>
	<h3>{$_('container.unselected.lead')}</h3>
	<p>{$_('container.unselected.sub')}</p>
</Wrapper>