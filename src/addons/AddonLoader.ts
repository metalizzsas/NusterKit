import { IAddon } from "../interfaces/IAddon";
import { IMachine } from "../interfaces/IMachine";

/**
 * Load addons on spec file
 * TODO: Regulate problem with `@ts-ignore`
 * @experimental
 * @param specs Original specs
 * @param addon Addon data
 * @returns IMachine specs
 */
export function parseAddon(specs: IMachine, addon: IAddon): IMachine
{
    for(const addonCategory of addon.content)
    {
        if(addonCategory.type == "replace")
        {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            specs[addonCategory.category] = addonCategory.content;
        }
        else
        {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            specs[addonCategory.category].push(...addonCategory.content);
        }
    }

    return specs;
}