import { register, init } from 'svelte-i18n';
import { getCookie } from './cookies';
import { getLang } from './settings';

export function initI18n(document: Document)
{
    register('en', () => import('$lib/lang/en.json'));
    register('fr', () => import('$lib/lang/fr-fr.json'));
    
    init({
        fallbackLocale: 'en',
        initialLocale: getLang(),
    });
}
