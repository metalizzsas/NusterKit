<script lang="ts">
	import { machineData } from '$lib/utils/store';
	import { scale, fade } from 'svelte/transition';

	import img from '$lib/img/1024.png';

	let isShrinked = true;
</script>

<!-- header info block -->
<div
	class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-b-3xl -m-6 mb-5 p-5 text-white shadow-2xl"
	id="informationWrapper"
>
	<div class="grid grid-col-2 gap-4">
		<div id="informationContent">
			<div class="flex flex-row justify-between items-center">
				<div class="flex flex-rox gap-4 items-center">
					{#if isShrinked}
						<!-- svelte-ignore component-name-lowercase -->
						<img
							in:scale
							out:scale
							src={img}
							alt="logo nuster"
							class="w-8 h-8 shadow-sm rounded-md hover:rotate-[2deg] transition-all"
						/>
					{/if}
					<span
						class="inline-block text-white font-semibold {!isShrinked
							? 'border-b-zinc-100 border-b-2'
							: ''} text-lg"
						in:fade
						out:fade
					>
						{isShrinked ? 'Nuster' : 'Informations machine'}
					</span>
				</div>

				<button
					class="rounded-full backdrop-brightness-125 p-1 transition hover:rotate-180 duration-300"
					on:click={() => {
						isShrinked = !isShrinked;
						console.log('is', isShrinked);
					}}
				>
					<svg
						id="glyphicons-basic"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 32 32"
						class="fill-white h-5 w-5"
					>
						<path
							id="circle-info"
							d="M16,4A12,12,0,1,0,28,16,12.01312,12.01312,0,0,0,16,4Zm2.42529,10.91565L16.6,21h1.25958a.5.5,0,0,1,.48505.62134l-.25,1A.50007.50007,0,0,1,17.60962,23H14a1.40763,1.40763,0,0,1-1.42529-1.91565L14.4,15h-.75958a.5.5,0,0,1-.48505-.62134l.25-1A.49994.49994,0,0,1,13.89038,13H17A1.40763,1.40763,0,0,1,18.42529,14.91565Zm.14435-3.33337A.5.5,0,0,1,18.07642,12H15.59021a.5.5,0,0,1-.49316-.58228l.33331-2A.5.5,0,0,1,15.92358,9h2.48621a.5.5,0,0,1,.49316.58228Z"
						/>
					</svg>
				</button>
			</div>

			{#if !isShrinked}
				<div in:scale out:scale>
					<div class="grid grid-cols-3 gap-5 items-center mt-4">
						<span
							class="block text-white font-medium py-2 px-4 rounded-full backdrop-brightness-125"
						>
							Modèle: {$machineData.machine.model.toLocaleLowerCase()}
						</span>
						<span
							class="block text-white font-medium py-2 px-4 rounded-full backdrop-brightness-125"
						>
							Variante: {$machineData.machine.variant.toUpperCase()}
						</span>
						<span
							class="block text-white font-medium py-2 px-4 rounded-full backdrop-brightness-125"
						>
							Révision: {$machineData.machine.revision}
						</span>
					</div>
					<div class="flex flex-col mt-3">
						<span
							class="block text-white font-medium py-2 px-4 rounded-full backdrop-brightness-125"
						>
							Numéro de série: {$machineData.machine.serial.toLocaleUpperCase()}
						</span>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
