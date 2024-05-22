import type { Configuration } from "./configuration";
import type { WebsocketData, Status } from "./hydrated";
import type { MachineSpecs } from "./spec";
import type { Addon } from "./spec/addons";

import { TranslationsSchema, ConfigSchema, SpecsSchema } from "./schemas";

type MachineSpecsList = Record<string, MachineSpecs>;

export { Configuration, Addon, MachineSpecs, WebsocketData, Status, TranslationsSchema, ConfigSchema, SpecsSchema, MachineSpecsList };