<script lang="ts">
	import '$lib/app.css';
	import endSound from '$lib/sounds/cycle-end.wav';
	import { onDestroy, onMount } from 'svelte';

	import howler from 'howler';
	import { machineData } from '$lib/utils/stores/store';
	import { Linker } from '$lib/utils/stores/linker';
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { navTitle, useNavContainer } from '$lib/utils/stores/navstack';
	import Navcontainer from '../navigation/navcontainer.svelte';
	import Navcontainertitle from '../navigation/navcontainertitle.svelte';
	import Button from '../button.svelte';
	import Flex from '../layout/flex.svelte';
	import Rating from '../userInputs/rating.svelte';

	let rating = 0;

	let endSoundInstance: howler.Howl | null = null;

	onMount(() => {
		endSoundInstance = new howler.Howl({
			src: [endSound],
			loop: true,
			volume: 0.5,
			autoplay: true,
		});
	});

	onDestroy(() => {
		if (endSoundInstance) {
			endSoundInstance.stop();
		}
	});

	async function patchCycle() {
		fetch('//' + $Linker + '/api/v1/cycle/' + rating, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
		}).then(() => {
			setTimeout(() => {
				goto('/app');
			}, 500);
		});
	}

	const parseDuration = (start: number, end: number) => {
		const diff = end - start;

		const hours = new Date(diff).getHours() - 1;
		const minutes = new Date(diff).getMinutes();
		const seconds = new Date(diff).getSeconds();

		const hoursShown = hours > 0;
		const hoursPlural = hours != 1;
		const minutesPlural = minutes != 1;
		const secondsPlural = seconds != 1;

		return (
			(hoursShown ? `${hours} ${$_(hoursPlural ? 'date.hours' : 'date.hour')}` : ``) +
			` ${minutes} ${$_(minutesPlural ? 'date.minutes' : 'date.minute')} ${seconds} ${$_(
				secondsPlural ? 'date.seconds' : 'date.second',
			)}`
		);
	};

	$navTitle = [$_('cycle.button'), $_('cycle.end.cycle-ended')];
	$useNavContainer = false;
</script>

<Flex class="-mt-6">
	<Navcontainer classes="min-w-[60%]">
		<Navcontainertitle>{$_('cycle.end.cycle-ended')}</Navcontainertitle>
		<Flex class="justify-center items-center">
			<div class="rounded-full bg-white p-4 shadow-lg">
				{#if $machineData.cycle?.status.endReason != 'finished'}
					<svg
						id="glyphicons-basic"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 32 32"
						class="fill-red-500 h-8 w-8 rotate-45"
					>
						<path
							id="plus"
							d="M27,14v4a1,1,0,0,1-1,1H19v7a1,1,0,0,1-1,1H14a1,1,0,0,1-1-1V19H6a1,1,0,0,1-1-1V14a1,1,0,0,1,1-1h7V6a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v7h7A1,1,0,0,1,27,14Z"
						/>
					</svg>
				{:else}
					<svg
						id="glyphicons-basic"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 32 32"
						class="fill-emerald-500 h-8 w-8"
					>
						<path
							id="check"
							d="M27.37592,9.70459l-14.151,15.97693a.99985.99985,0,0,1-1.47558.02356L4.59711,18.1322a.99992.99992,0,0,1-.05384-1.31128L5.495,15.63123a.99994.99994,0,0,1,1.22808-.26966L12,18,24.79724,7.09863a.99991.99991,0,0,1,1.35553.0542l1.1817,1.18164A1,1,0,0,1,27.37592,9.70459Z"
						/>
					</svg>
				{/if}
			</div>

			<Flex direction="col" gap={0} class="rounded-xl bg-white p-3">
				<span class="font-semibold">
					{$_('cycle.endreasons.' + $machineData.cycle?.status.endReason)}
				</span>
				{#if $machineData.cycle?.status.startDate && $machineData.cycle?.status.endDate}
					<span class="text-italic">
						{$_('cycle.end.cycle-duration')} : {parseDuration(
							$machineData.cycle?.status.startDate,
							$machineData.cycle?.status.endDate,
						)}
					</span>
				{/if}
			</Flex>
		</Flex>

		<div class="h-[1px] bg-zinc-400 w-2/3 mx-auto my-4" />

		<Flex class="justify-center">
			<Button on:click={patchCycle}>{$_('cycle.buttons.complete')}</Button>
		</Flex>
	</Navcontainer>

	<Navcontainer classes="grow">
		<Navcontainertitle>{$_('cycle.end.cycle-rating-lead')}</Navcontainertitle>

		<section class="font-semibold text-center p-3 rounded-xl bg-white mx-auto">
			<p class="font-normal">
				{$_('cycle.end.cycle-rating-text')}
			</p>
		</section>

		<Flex class="justify-center mt-3">
			<Rating bind:rating />
		</Flex>
	</Navcontainer>
</Flex>
