import type { Configuration } from '@metalizzsas/nuster-typings';
import { addMessages } from 'svelte-i18n';

export async function initI18nMachine(machine: Configuration)
{
    const langs = import.meta.glob("../../../../node_modules/@metalizzsas/nuster-misc/i18n/machines/**/*.json", { query: "?json" });

    for(const lang of Object.keys(langs).filter(k => k.includes(`${machine.model}-${machine.variant}-${machine.revision}`)))
    {
        const langName = lang.split("/").at(-1)?.split(".").at(0);
        const langFile = await langs[lang]();

        if(langName !== undefined && langFile !== undefined)
        {
            addMessages(langName, langFile as any);
        }
    }
}
