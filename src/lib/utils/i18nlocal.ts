import { init, addMessages } from 'svelte-i18n';

import en from "$lib/lang/en.json";
import fr from "$lib/lang/fr.json";

export function initi18nLocal()
{
    addMessages('en', en);
    addMessages('fr', fr);
    
    init({
        fallbackLocale: 'en',
        initialLocale: 'en',
    });
}
