import { init, addMessages } from 'svelte-i18n';

import en from "@metalizzsas/nuster-misc/i18n/desktop/en.json";
import fr from "@metalizzsas/nuster-misc/i18n/desktop/fr.json";
import it from "@metalizzsas/nuster-misc/i18n/desktop/it.json";

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
