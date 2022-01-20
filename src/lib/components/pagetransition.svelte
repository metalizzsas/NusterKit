<script>
	import { fly } from 'svelte/transition';
</script>

<div in:fly={{ y: -100, duration: 250, delay: 300 }} out:fly={{ y: -100, duration: 250 }}>
	<slot />
</div>
