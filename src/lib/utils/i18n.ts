import { init, addMessages } from 'svelte-i18n';
import { getLang } from './settings';

import en from "$lib/lang/en.json";
import fr from "$lib/lang/fr.json";

export async function initI18n(ip: string)
{
    return new Promise<void>((resolve) => {

        addMessages('en', en);
        addMessages('fr', fr);
    
        const enurl = `//${ip}/api/assets/lang/en.json`;
        const frurl = `//${ip}/api/assets/lang/fr.json`;

        const langEN = fetch(enurl).then((response) => {
            if(response.status == 200)
            {
                response.json().then((content) => {
                    addMessages("en", content);
                });
            }
        });
    
        const langFR = fetch(frurl).then((response) => {
            if(response.status == 200)
            {
                response.json().then((content) => {
                    addMessages("fr", content);
                });
            }
        });
    
        Promise.all([langEN, langFR]).then(async () => {
            await init({
                fallbackLocale: 'en',
                initialLocale: getLang(),
            });
            resolve();
        });
    });
    
}

export async function initi18nLocal()
{
    addMessages('en', en);
    addMessages('fr', fr);
}
