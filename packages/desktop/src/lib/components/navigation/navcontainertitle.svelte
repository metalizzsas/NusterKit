<script lang="ts">
	export let sided = false;
</script>

<div 
	class:-mt-3={!sided}
	class:-ml-3={sided}
	class:my-4={sided}
	class={$$props.class}
>
	<div
		class="py-1 px-5 text-white bg-indigo-400 inline-block font-semibold shadow-xl"
		class:rounded-b-xl={!sided}
		class:rounded-r-xl={sided}
		class:mb-4={!sided}
	>
		<slot />
	</div>
</div>