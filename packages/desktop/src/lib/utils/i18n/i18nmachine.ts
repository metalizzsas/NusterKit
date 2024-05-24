import { env } from '$env/dynamic/public';
import { addMessages } from 'svelte-i18n';

export async function initI18nMachine()
{
    const frRequest = await fetch(`http://${env.PUBLIC_TURBINE_ADDRESS}/static/i18n/fr.json`);
    const enRequest = await fetch(`http://${env.PUBLIC_TURBINE_ADDRESS}/static/i18n/en.json`);
    const itRequest = await fetch(`http://${env.PUBLIC_TURBINE_ADDRESS}/static/i18n/it.json`);

    if(frRequest.status === 200 && frRequest.ok)
    {
        const fr = await frRequest.json();
        addMessages('fr', fr);
    }
    
    if(enRequest.status === 200 && enRequest.ok)
    {
        const en = await enRequest.json();
        addMessages('en', en);
    }

    if(itRequest.status === 200 && itRequest.ok)
    {
        const it = await itRequest.json();
        addMessages('it', it);
    }
}
