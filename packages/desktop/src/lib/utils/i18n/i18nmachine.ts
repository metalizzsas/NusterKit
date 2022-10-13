import { addMessages } from 'svelte-i18n';

export async function initI18nMachine(ip: string)
{
    return new Promise<void>(resolve => {
    
        const enurl = `//${ip}/api/assets/lang/en.json`;
        const frurl = `//${ip}/api/assets/lang/fr.json`;

        const langEN = fetch(enurl).then((response) => {
            if(response.status == 200)
            {
                response.json().then((content) => {
                    addMessages("en", content);
                }).catch(() => {
                    throw new Error("Failed to add En language file");
                })
            }
        });
    
        const langFR = fetch(frurl).then((response) => {
            if(response.status == 200)
            {
                response.json().then((content) => {
                    addMessages("fr", content);
                }).catch(() => {
                    throw new Error("Failed to add FR language file");
                })
            }
        });
    
        
        Promise.all([langEN, langFR]).then(() => {
            console.log('Langs from machine loaded');
            resolve();
        }).catch((e: Error) => {
            console.error(e.message);
        });
    });
}
