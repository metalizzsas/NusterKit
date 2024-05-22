import { init, addMessages } from 'svelte-i18n';

import en from "$lib/utils/i18n/translations/en.json";
import fr from "$lib/utils/i18n/translations/fr.json";
import it from "$lib/utils/i18n/translations/it.json";

export function initi18nLocal()
{
    addMessages('en', en);
    addMessages('fr', fr);
    addMessages('it', it);
    
    void init({
        fallbackLocale: 'en',
        initialLocale: 'en',
    });
}
