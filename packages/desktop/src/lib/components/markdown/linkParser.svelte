<script lang="ts">
    let href= "#";
    export let title: string | undefined = undefined;
  </script>
  
  <a {href} {title}><slot></slot></a>