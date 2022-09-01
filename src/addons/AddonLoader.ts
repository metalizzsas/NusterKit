import pino from "pino";
import { IAddon } from "../interfaces/IAddon";
import { IMachine } from "../interfaces/IMachine";

/**
 * Load addons on spec file
 * TODO: Regulate problem with `@ts-ignore`
 * @experimental
 * @param specs Original specs
 * @param addon Addon data
 * @param logger Logger
 * @returns IMachine specs
 */
export function parseAddon(specs: IMachine, addon: IAddon, logger: pino.Logger): IMachine
{
    for(const addonCategory of addon.content)
    {
        logger.info("Addon: Adding " + addonCategory.category + " Sub-element with mode " + addonCategory.type + ".")
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