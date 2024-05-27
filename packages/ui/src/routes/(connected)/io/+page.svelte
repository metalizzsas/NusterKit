<script lang="ts">

	import Flex from "$lib/components/layout/flex.svelte";

    import { _ } from "svelte-i18n";
    
	import { Icon } from "@steeze-ui/svelte-icon";
    import { ArrowLeftOnRectangle, ArrowRightOnRectangle } from "@steeze-ui/heroicons"; 
	import Gate from "./Gate.svelte";
	import { realtime } from "$lib/utils/stores/nuster";
	import Wrapper from "$lib/components/Wrapper.svelte";
	import SelectableButton from "$lib/components/buttons/SelectableButton.svelte";
	import type { Snapshot } from "./$types";

    let selectedBus: "in" | "out" = "in";
    let buses: Array<"in" | "out"> = ["in", "out"];

	export const snapshot: Snapshot<"in" | "out"> = {
		capture: () => selectedBus,
		restore: (bus) => selectedBus = bus
	}

</script>

<Flex direction="row" gap={6}>
	<div class="shrink-0 drop-shadow-xl">
		<Wrapper>
			<Flex direction="col" gap={2}>
				<h1 class="leading-8">{$_(`gates.lead`)}</h1>
				{#each buses as bus}
					<SelectableButton selected={selectedBus == bus} on:click={() => selectedBus = bus}>
						<Flex gap={4} items="center">
							<Icon src={bus == "in" ? ArrowLeftOnRectangle: ArrowRightOnRectangle} class="h-4 w-4" />
							<h2>{$_('gates.bus.' + bus)}</h2>
						</Flex>
					</SelectableButton>
				{/each}
			</Flex>
		</Wrapper>
	</div>

	<div class="grow drop-shadow-xl">
		<Wrapper>
			<h2 class="leading-10">{$_('gates.bus.' + selectedBus)}</h2>
			<Flex direction="col" gap={1}>
				{#each $realtime.io.filter(i => i.bus == selectedBus) as iog}
					<Gate bind:io={iog} editable={iog.bus === "out"}/>
				{/each}
			</Flex>
		</Wrapper>
	</div>
</Flex>