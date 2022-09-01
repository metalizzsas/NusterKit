<script lang="ts">
	/**
	 * Flex direction
	 */
	export let direction: 'row' | 'col' = 'row';
	/**
	 * Flex wrap
	 */
	export let wrap: null | 'wrap' | 'reverse' | 'nowrap' = null;

	/**
	 * Gap between items
	 */
	export let gap: number = 4;

	//items positionment
	/**
	 * Items positionment
	 */
	export let items: null | 'center' | 'start' | 'end' | 'baseline' | 'stretch' = null;
	/**
	 * Content justify
	 */
	export let justify:
		| null
		| 'start'
		| 'end'
		| 'center'
		| 'between'
		| 'around'
		| 'evenly'
		| 'items-start'
		| 'items-end'
		| 'items-center'
		| 'items-stretch'
		| 'self-auto'
		| 'self-start'
		| 'self-end'
		| 'self-center'
		| 'self-stretch' = null;
	/**
	 * Content alignment
	 */
	export let align:
		| null
		| 'baseline'
		| 'top'
		| 'middle'
		| 'bottom'
		| 'text-top'
		| 'text-bottom'
		| 'sub'
		| 'super' = null;
</script>

<div
	class="flex flex-{direction} gap-{gap} {items != null ? 'items-' + items : ''} {justify != null
		? 'justify-' + justify
		: ''} {wrap != null ? 'flex-' + wrap : ''} {align != null
		? 'align-' + align
		: ''} {$$props.class}"
>
	<slot />
</div>
