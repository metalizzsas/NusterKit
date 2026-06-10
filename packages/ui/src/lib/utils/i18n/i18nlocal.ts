import { init, addMessages } from 'svelte-i18n';

import en from "$lib/utils/i18n/translations/en.json";
import fr from "$lib/utils/i18n/translations/fr.json";
import it from "$lib/utils/i18n/translations/it.json";
import de from "$lib/utils/i18n/translations/de.json";

export async function loadLocals()
{
    addMessages('en', en);
    addMessages('fr', fr);
    addMessages('it', it);
    addMessages('de', de);
    
    await init({
        fallbackLocale: 'en',
        initialLocale: 'en'
    });
}