<script lang="ts">

    export let name: string;
    export let type: "number" | "email" | "text" | "password";
    export let mandatory = false;
    export let title: string;

    export let value: string | number | null = null;
    export let placeholder: string | undefined = undefined;
    export let autocomplete: string | undefined = undefined;

</script>


<div>
    <span class="text-zinc-300 mb-1 uppercase text-xs inline-block">{title}</span>
    {#if mandatory === true}
        <span class="text-red-500 text-sm">*</span>
    {/if}
    <input {type} {name} {placeholder} {value} {autocomplete} class="bg-zinc-800/25 p-2 rounded-md border border-zinc-300/25 w-full text-zinc-300" />
</div>