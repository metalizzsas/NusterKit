import pino from "pino";
import { deepInsert } from "../deepSet";
import { IAddon } from "../interfaces/IAddon";
import { IMachine, IMachinePaths } from "../interfaces/IMachine";

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
        logger.info(" ↳ Adding content on " + content.path + " with " + content.mode + " mode.")
        specs = deepInsert(specs, content.content, content.path as IMachinePaths, content.mode);
    }

    return specs;
}