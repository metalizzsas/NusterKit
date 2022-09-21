import pino from "pino";
import { deepInsert } from "../deepSet";
import { IAddon } from "../interfaces/IAddon";
import { IMachine } from "../interfaces/IMachine";

/**
 * Load addons on spec file
 * @experimental
 * @param specs Original specs
 * @param addon Addon data
 * @param logger Logger
 * @returns IMachine specs
 */
export function parseAddon(specs: IMachine, addon: IAddon, logger: pino.Logger): IMachine
{
    logger.info("AddonLoader: Adding " + addon.addonName + ".");

    for(const content of addon.content)
    {
        logger.info(" ↳ Adding content with " + content.path + ".")
        deepInsert(specs, content.content, content.path);
    }

    return specs;
}