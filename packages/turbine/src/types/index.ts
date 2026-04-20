import type { Configuration } from "./configuration";
import type { Status, WebsocketData } from "./hydrated";
import { ConfigSchema, SpecsSchema, TranslationsSchema } from "./schemas";
import type { MachineSpecs } from "./spec";
import type { Addon } from "./spec/addons";

type MachineSpecsList = Record<string, MachineSpecs>;

export {
	type Addon,
	ConfigSchema,
	type Configuration,
	type MachineSpecs,
	type MachineSpecsList,
	SpecsSchema,
	type Status,
	TranslationsSchema,
	type WebsocketData,
};
