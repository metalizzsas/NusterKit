<script lang="ts">
	export let title: string = 'default';

	export let call: Function = () => {};

	export let preventDefault: boolean = false;
</script>

<div class="mb-5">
	<div class="flex flex-row justify-between items-center">
		<div class="flex flex-row justify-items-end gap-4 items-center">
			<button
				on:click={async () => {
					if (call) {
						console.log('call is present');
						await call();
					}
					if (!preventDefault) window.history.back();
				}}
				class="backdrop-brightness-125 fill-neutral-700 hover:fill-neutral-500 hover:backdrop-brightness-75 transition-all duration-200 p-2 rounded-full"
			>
				<svg
					id="glyphicons-basic"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 32 32"
					class="h-5 w-5"
				>
					<path
						id="chevron-left"
						d="M22.41406,23.37866a.5.5,0,0,1,0,.70709L19.586,26.91425a.50007.50007,0,0,1-.70715,0L8.67151,16.70709a.99988.99988,0,0,1,0-1.41418L18.87885,5.08575a.50007.50007,0,0,1,.70715,0l2.82806,2.8285a.5.5,0,0,1,0,.70709L15.03564,16Z"
					/>
				</svg>
			</button>
			<h1 class="text-xl text-neutral-700 backdrop-brightness-125 py-1 px-3 rounded-full">
				{title}
			</h1>
		</div>
		<slot />
	</div>
</div>
