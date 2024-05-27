<script lang="ts">
	import { onMount } from "svelte";

    let time = 0;

    onMount(() => {
        const interval = setInterval(() => {

            if(time >= 5)
                window.location.reload();
            
            time++;
        }, 1000);

        return clearInterval(interval);
    });

</script>

<h1>Server render error</h1>
<p>Refreshing in {5 - time} seconds.</p>

<a href="/">Redirect now</a>