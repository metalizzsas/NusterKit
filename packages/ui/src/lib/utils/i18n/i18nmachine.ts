import { addMessages } from 'svelte-i18n';

const LANGUAGES = ['fr', 'en', 'it'] as const;

export async function initI18nMachine()
{
    for (const lang of LANGUAGES)
    {
        const response = await fetch(`/files/i18n/${lang}.json`);

        if(response.ok)
        {
            const messages = await response.json();
            addMessages(lang, messages);
        }
    }
}
