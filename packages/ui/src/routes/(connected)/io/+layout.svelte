<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import Wrapper from "$lib/components/Wrapper.svelte";
	import SelectableButton from "$lib/components/buttons/SelectableButton.svelte";
	import Flex from "$lib/components/layout/flex.svelte";
	import { ArrowLeftOnRectangle, ArrowRightOnRectangle } from "@steeze-ui/heroicons";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { _ } from "svelte-i18n";
</script>

<Flex direction="row" gap={6}>
	<div class="shrink-0 drop-shadow-xl">
		<Wrapper>
			<Flex direction="col" gap={2}>
				<h1 class="leading-8">{$_(`gates.lead`)}</h1>
				{#each ["in", "out"] as bus}
					<SelectableButton selected={$page.params.bus == bus} on:click={() => goto(`/io/${bus}`)}>
						<Flex gap={4} items="center">
							<Icon src={$page.params.bus == "in" ? ArrowLeftOnRectangle: ArrowRightOnRectangle} class="h-4 w-4" />
							<h2>{$_('gates.bus.' + bus)}</h2>
						</Flex>
					</SelectableButton>
				{/each}
			</Flex>
		</Wrapper>
	</div>

	<div class="grow drop-shadow-xl">
		<Wrapper>
            <h2 class="leading-10">{$_('gates.bus.' + $page.params.bus)}</h2>
			<Flex direction="col" gap={1}>
                <slot />
			</Flex>
		</Wrapper>
	</div>
</Flex>