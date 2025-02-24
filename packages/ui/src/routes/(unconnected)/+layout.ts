import { browser } from "$app/environment"
import { loadLocals } from "$lib/utils/i18n/i18nlocal"
import { waitLocale } from "svelte-i18n";

export const load = async ({ data }) => {
    
    await loadLocals();
    await waitLocale();

    return { ...data };

}