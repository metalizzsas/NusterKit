<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/buttons/Button.svelte';
	import Wrapper from '$lib/components/Wrapper.svelte';

	import { _ } from 'svelte-i18n';

	const redirect = () => {
		window.location.href = '/';
	};
</script>

<div class="w-screen flex flex-row justify-center">
	<Wrapper>
		<div class="flex flex-row gap-8 items-center align-middle">
			<img
				src="/icons/icon-512.png"
				alt={$_('nuster.logo')}
				class="h-44 aspect-square rounded-xl ring-indigo-500 ring-[2px]"
			/>
			<div>
				<h1 class="text-xl">{$_('error.render.lead')}</h1>
				<h2 class="text-base">{$_('error.render.sub')}</h2>
				<p class="mt-2 mb-4">{$page.status} - {$page.error?.message}</p>
				<Button on:click={redirect}>{$_('error.render.button')}</Button>
			</div>
		</div>
	</Wrapper>
</div>
