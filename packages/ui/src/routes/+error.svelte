<script lang="ts">
	import { page } from '$app/stores';
</script>

<h1>Server render error</h1>
<p>{$page.error?.message}</p>

<a href="/">Reload page</a>