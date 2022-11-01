import { initi18nLocal } from '$lib/utils/i18n/i18nlocal';
import type { LayoutLoad } from './$types';

export const ssr = false;

export const load: LayoutLoad = () => {
	initi18nLocal(); // Load local translations jsons
	return {};
};
