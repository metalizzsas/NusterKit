import { locale, waitLocale } from 'svelte-i18n';
import { loadLocals } from "$lib/utils/i18n/i18nlocal";
import { browser } from '$app/environment';

export const load = async ({ data }) => {

    await loadLocals();
    await waitLocale();
    if (browser) locale.set(data.settings.lang);

    return { ...data };

};