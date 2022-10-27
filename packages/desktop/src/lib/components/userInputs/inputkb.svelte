<script lang="ts">
	import Keyboard from 'simple-keyboard';
	import 'simple-keyboard/build/css/index.css';

	import Portal from 'svelte-portal';

	import { fly } from 'svelte/transition';

	import { _ } from 'svelte-i18n';
	import { keyboardShown, keyboardHeight } from '$lib/utils/stores/keyboard';
	import { BUNDLED } from '$lib/bundle';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{change: {value: number | string}}>();
	export let change = () => dispatch('change', { value: value });

	export let value: string | number;
	export let disabled = false;
	export let automaticLength = false;

	/**
	 * options.class @deprecated
	 */
	export let options: { class?: string; placeholder?: string; min?: number; max?: number } = {};

	const focusScroll = () => document.getElementById(typeof value === 'number' ? '#inputNumeric' : '#inputString')?.scrollTo();

	let focused = false;

	const initkb = () => {
		const keyboard = new Keyboard('keyboard', {
			value: value,
			onChange: (input) => {
				value = input;
			},
			onKeyPress: (button: string) => {
				if (focused && button == '{enter}') {
					focused = false;
				}
			},
			inputPattern: typeof value === 'number' ? /^[0-9]*$/ : undefined,
		});

		keyboard.setInput(`${value}`);
	};

	let scrollY: number;

	$: if (focused == true && BUNDLED == 'true') {
		setTimeout(() => {
			initkb();
			focusScroll();
		}, 50);
	}

	$: if(focused && BUNDLED == "true") { $keyboardShown = true } else { $keyboardShown = false}
	$: if(focused == false) { change() }
</script>

<svelte:window bind:scrollY />

<Portal target="body">
	{#if focused && BUNDLED == 'true'}
		<div
			class="rounded-t-xl fixed bottom-0 left-0 right-0 z-50 visible"
			in:fly={{ y: 300, duration: 250 }}
			out:fly={{ y: 300, duration: 250 }}
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
			<div class="bg-zinc-400 p-1 rounded-tl-xl" bind:clientHeight={$keyboardHeight}>
				<div class="keyboard" />
			</div>
		</div>
	{/if}
</Portal>

{#if typeof value === 'string'}
	<input
		id="inputString"
		type="text"
		class={`${options['class']} ${$$props.class || ''}`}
		placeholder={options['placeholder']}
		style={`-webkit-appearance: none; ${automaticLength ? 'width: {String(value).length}ch;' : ''}`}
		bind:value
		on:click={() => {
			focused = true;
			focusScroll();
		}}
		{disabled}
		autocomplete="off"
	/>
{:else}
	<input
		id="inputNumeric"
		type="number"
		class={`${options['class']} ${$$props.class || ''}`}
		autocomplete="off"
		min={options['min']}
		max={options['max']}
		style={`-webkit-appearance: none; ${automaticLength ? 'width: {String(value).length}ch;' : ''}`}
		bind:value
		on:click={() => {
			focused = true;
			focusScroll();
		}}
		{disabled}
	/>
{/if}
