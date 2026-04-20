import type { Addon, MachineSpecs } from "$types/index";
import { deepInsert } from "./deep-insert";
import { TurbineEventLoop } from "../events";

/**
 * Load addons on spec file
 * @experimental
 * @param specs Original specs
 * @param addon Addon data
 * @param logger Logger
 * @returns IMachine specs
 */
export function parseAddon(specs: MachineSpecs, addon: Addon): MachineSpecs
{
    TurbineEventLoop.emit('log', 'info', "AddonLoader: Adding " + addon.addonName + ".");

    for(const content of addon.content)
    {
        TurbineEventLoop.emit('log', 'info', " ↳ Adding content on " + content.path + " with " + content.mode + " mode.")
        specs = deepInsert(specs, content.content, content.path, content.mode);
    }

    return specs;
}