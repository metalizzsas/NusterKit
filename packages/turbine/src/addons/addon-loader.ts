import type { Addon, MachineSpecs } from "$types/index";
import { TurbineEventLoop } from "../events";
import { deep_insert } from "./deep-insert";

/**
 * Load addons on spec file
 * @experimental
 * @param specs Original specs
 * @param addon Addon data
 * @param logger Logger
 * @returns IMachine specs
 */
export function parse_addon(specs: MachineSpecs, addon: Addon): MachineSpecs {
	TurbineEventLoop.emit("log", "info", "AddonLoader: Adding " + addon.addonName + ".");

	for (const content of addon.content) {
		TurbineEventLoop.emit("log", "info", " ↳ Adding content on " + content.path + " with " + content.mode + " mode.");
		specs = deep_insert(specs, content.content, content.path, content.mode);
	}

	return specs;
}
