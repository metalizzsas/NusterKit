import { init, addMessages } from 'svelte-i18n';

import en from "$lib/lang/en.json";
import fr from "$lib/lang/fr.json";
import it from "$lib/lang/it.json";

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
