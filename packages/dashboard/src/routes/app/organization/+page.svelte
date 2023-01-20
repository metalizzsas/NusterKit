<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;

</script>

<h2 class="text-3xl">Organisation</h2>
<p>Ici vous pouvez gérer votre organisation.</p>

<pre class="p-2 bg-white rounded-md text-zinc-800">{JSON.stringify(data, undefined, 4)}</pre>