import { IAddon, IMachineSpecs } from "@metalizz/nuster-typings";
import pino from "pino";
import { deepInsert } from "../deepInsert";

/**
 * Load addons on spec file
 * @experimental
 * @param specs Original specs
 * @param addon Addon data
 * @param logger Logger
 * @returns IMachine specs
 */
export function parseAddon(specs: IMachineSpecs, addon: IAddon, logger: pino.Logger): IMachineSpecs
{
    logger.info("AddonLoader: Adding " + addon.addonName + ".");

    for(const content of addon.content)
    {
        logger.info(" ↳ Adding content on " + content.path + " with " + content.mode + " mode.")
        specs = deepInsert(specs, content.content, content.path, content.mode);
    }

    return specs;
}