<script lang="ts">
	export let value: string | number;

	export let disabled = false;

	export let options: { [x: string]: string | number } = {};

	import Keyboard from 'simple-keyboard';
	import 'simple-keyboard/build/css/index.css';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';

	let rand = Math.floor(Math.random() * 100000);

	onMount(() => {
		const keyboard = new Keyboard('kb' + rand, {
			value: value,
			onChange: (input) => onChange(input),
			onKeyPress: (button) => onKeyPress(button),
			inputPattern: typeof value === 'number' ? /^[0-9]*$/ : undefined,
		});

		keyboard.setInput('' + value);

		function onChange(input) {
			value = input;
		}
		function onKeyPress(button) {
			if (focused && button == '{enter}') {
				focused = false;
			}
		}
	});

	function focusScroll() {
		document
			.getElementById(typeof value === 'number' ? '#inputNumeric' : '#inputString')
			?.scrollTo();
	}

	let focused = false;

	let scrollY: number;
</script>

<svelte:window bind:scrollY />

<div
	class="rounded-t-xl fixed bottom-0 left-0 right-0 z-50 {focused
		? 'visible opacity-100'
		: 'invisible opacity-0'} transition-all"
>
	<div class="flex justify-end items-end">
		<div
			class="bg-zinc-400 h-3 w-3"
			style="-webkit-mask-image: radial-gradient(circle 0.375rem at 0 0, transparent 0, transparent 0.75rem, black 0.75rem);"
		/>
		<div class="bg-zinc-400 p-1 pb-1 rounded-t-xl">
			<div
				class="bg-white text-xs font-semibold rounded-full p-1 px-3 mb-1"
				on:click={() => (focused = false)}
			>
				{$_('close-keyboard')}
			</div>
		</div>
	</div>
	<div class="bg-zinc-400 p-1 rounded-tl-xl">
		<div class={'kb' + rand} />
	</div>
</div>

{#if typeof value === 'string'}
	<input
		id="inputString"
		type="text"
		class={options['class']}
		placeholder={options['placeholder']}
		bind:value
		on:click={() => {
			focused = true;
			focusScroll();
		}}
		{disabled}
	/>
{:else}
	<input
		id="inputNumeric"
		type="number"
		class={options['class']}
		min={options['min']}
		max={options['max']}
		bind:value
		on:click={() => {
			focused = true;
			focusScroll();
		}}
		{disabled}
	/>
{/if}
