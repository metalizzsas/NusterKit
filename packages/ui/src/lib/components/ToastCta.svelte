<script lang="ts">
	import type { Popup, CallToActionFront } from "$lib/types/turbine";
	import { ExclamationCircle, ExclamationTriangle, InformationCircle, XMark } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { _ } from "svelte-i18n";
	import { enhance } from "$app/forms";
	import Button from "./buttons/Button.svelte";
	import Flex from "./layout/flex.svelte";

	let {
		popup,
		closeToast,
	}: {
		popup: Popup<CallToActionFront>;
		closeToast?: () => void;
	} = $props();

	const icons = {
		info: { icon: InformationCircle, color: "text-indigo-500" },
		warn: { icon: ExclamationTriangle, color: "text-amber-500" },
		error: { icon: ExclamationCircle, color: "text-red-500" },
	};
</script>

<div
	class="pointer-events-auto w-[24rem] max-w-[calc(100vw-3rem)] rounded-xl bg-zinc-900 p-4 text-white shadow-2xl ring-2 ring-inset ring-indigo-500 dark:bg-white dark:text-zinc-800"
>
	<Flex gap={2} items="center">
		<Icon
			src={icons[popup.level].icon}
			theme="solid"
			class="h-6 w-6 shrink-0 {icons[popup.level].color}"
		/>
		<h2 class="truncate text-base font-semibold">{$_(popup.title)}</h2>
		<button
			onclick={() => closeToast?.()}
			class="ml-auto grid h-8 w-8 place-items-center rounded-md hover:bg-white/10 dark:hover:bg-zinc-200"
			aria-label="Dismiss"
		>
			<Icon src={XMark} class="h-5 w-5" />
		</button>
	</Flex>

	<p class="break-words leading-6 {popup.callToActions ? 'my-3' : 'mt-3'}">
		{$_(popup.message, { values: popup.payload })}
	</p>

	{#if popup.callToActions}
		<Flex items="center" justify="center" gap={2}>
			{#each popup.callToActions as cta}
				<form action="?/callToAction" method="post" use:enhance onsubmit={() => closeToast?.()}>
					<input type="hidden" name="cta_id" value={cta.id} />
					<Button textColor="dark:text-zinc-800 text-white">{$_(cta.name)}</Button>
				</form>
			{/each}
		</Flex>
	{/if}
</div>
