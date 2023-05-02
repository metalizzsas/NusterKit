<script lang="ts">
    import type { Writable } from "svelte/store";
	import { getContext } from "svelte";

    export let href = '';
    const selectedHelp = getContext<Writable<string | undefined>>("help");

    const navigate = (where: string) => {

        let pathToGo = ($selectedHelp ?? "").split("/");
        const folderAway = [...href.matchAll(new RegExp(/\.\.\//, "g"))].length;

        const relativePath = where.split("/").filter(k => k !== "..");
        const basePath = pathToGo?.slice(1, pathToGo.length - (1 + folderAway))

        const newPathToGo = [...basePath, ...relativePath];

        $selectedHelp = "/" + newPathToGo.join("/");        
    }

</script>

<button on:click={() => navigate(href)} class="text-indigo-500 font-medium hover:text-indigo-600 duration-100"><slot /></button>
  