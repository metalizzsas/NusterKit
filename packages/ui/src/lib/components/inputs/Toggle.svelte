<script lang="ts">
	import type { FormInput } from './formInput';
	import { page } from '$app/stores';

	let {
		value = $bindable(),
		change = () => {},
		changeNum = () => {},
		locked = false,
		enableGrayScale = false,
		form = undefined,
	}: {
		value: number | boolean;
		change?: () => void;
		changeNum?: () => void;
		locked?: boolean;
		enableGrayScale?: boolean;
		form?: FormInput<"change">;
	} = $props();

	let checked = $state(false);
	let validateButton: HTMLButtonElement | undefined = $state();

	$effect.pre(() => {
		if (typeof value === 'boolean') checked = value;
		else if (typeof value === "undefined") { value = false; checked = false }
		else value == 0 ? (checked = false) : (checked = true);
	});
</script>

<button
	class="{!locked ? "dark:bg-white bg-black" : ($page.data.settings.dark) ? "toggle-bg-dark" : "toggle-bg"} relative block rounded-full h-6 w-12 min-h-fit min-w-fit toggle"
	class:grayscale={locked && enableGrayScale}
	class:checked={checked}
	class:uncheked={!checked}
	class:cursor-default={locked}
	onclick={() => {
		if (!locked)
		{
			if (typeof value === 'boolean')
			{
				value = !value;
				checked = value;
			}
			else
			{
				value == 0 ? (value = 1) : (value = 0);
				value == 0 ? (checked = true) : (checked = false);
			}
			change();
			changeNum();
			if (form?.validateOn === "change" && validateButton !== undefined) { setTimeout(() => validateButton?.click(), 10); }
		}
	}}
/>

{#if form !== undefined}
	<input type="hidden" name={form.name} bind:value form={form.formName} />
	{#if form.validateOn !== undefined}
		<button type="submit" form={form.formName} class="hidden" bind:this={validateButton}/>
	{/if}
{/if}

<style lang="postcss">
	@reference "tailwindcss";

	.toggle-bg-dark {
		background: repeating-linear-gradient(
			135deg,
			white,
			white 5px,
			rgb(212 212 216) 5px,
			rgb(212 212 216) 10px
		);
	}

	.toggle-bg {
		background: repeating-linear-gradient(
			135deg,
			black,
			black 5px,
			rgb(39 39 42) 5px,
			rgb(39 39 42) 10px
		);
	}

	.toggle::before {
		@apply block h-4 w-4 rounded-full;
		content: '';
		position: absolute;
		top: 0.25rem;
		transition: all 0.1s ease-in-out;
	}

	.uncheked::before
	{
		@apply bg-red-500;
		left: 0.25rem;
	}

	.checked::before
	{
		@apply bg-emerald-500;
		transform: translateX(1.75rem);
	}
</style>
