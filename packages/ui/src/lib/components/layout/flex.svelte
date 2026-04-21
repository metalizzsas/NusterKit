<script lang="ts">
	import type { Snippet } from "svelte";
	import {
		aligns,
		directions,
		gaps,
		itemsPosition,
		justifies,
		wraps,
		type FlexAlign,
		type FlexDirection,
		type FlexItemPosition,
		type FlexJustify,
		type FlexWrap,
		type GapSizes,
	} from '$lib/components/layout/flexTypes';

	let {
		direction = 'row',
		wrap = null,
		gap = 4,
		items = null,
		justify = null,
		align = null,
		class: class_name = '',
		children,
	}: {
		direction?: FlexDirection;
		wrap?: FlexWrap | null;
		gap?: null | GapSizes;
		items?: null | FlexItemPosition;
		justify?: null | FlexJustify;
		align?: null | FlexAlign;
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<div
	class="flex
	{directions[direction]}
	{gap != null ? gaps[gap] : ''}
	{items != null ? itemsPosition[items] : ''}
	{justify != null ? justifies[justify] : ''}
	{wrap != null ? wraps[wrap] : ''}
	{align != null ? aligns[align] : ''}
	{class_name}"
>
	{@render children?.()}
</div>
