<script lang="ts">
    import "$lib/app.css";
	import { loadLocals } from "$lib/utils/i18n/i18nlocal";
    import "@fontsource/inter/400.css";
    import "@fontsource/inter/500.css";
    import "@fontsource/inter/600.css";
    import "@fontsource/inter/700.css";
    import "@fontsource/inter/800.css";
    import "@fontsource/inter/900.css";
	import { onMount } from "svelte";

    onMount(async () => {
        await loadLocals();
    });
</script>

<div class="p-6">
    <slot />
</div>