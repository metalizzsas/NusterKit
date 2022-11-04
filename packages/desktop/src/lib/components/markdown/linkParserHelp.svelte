<script lang="ts">
    export let href = "#";
    export let title: string | undefined = undefined;
  </script>

  {#if href.includes("#")}
    <a href={href} {title}><slot></slot></a>
    {:else}
    <a href={`/app/help/${href.replace("./", "")}`} {title}><slot></slot></a>
  {/if}
  