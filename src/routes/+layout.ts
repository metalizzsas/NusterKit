import type { LayoutLoad } from '@sveltejs/kit';

export const load: LayoutLoad = () => {
	initi18nLocal(); // Load local translations jsons
	return {};
};
