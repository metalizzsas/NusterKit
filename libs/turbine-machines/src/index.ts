// @ts-nocheck

import type { MachineSpecs } from "@metalizzsas/nuster-typings/build/index";
import type { ConfigModel, ConfigVariant } from "@metalizzsas/nuster-typings/build/configuration";

import * as MetalfogMR0 from "./data/metalfog-m-0/specs.json";
import * as MetalfogMR1 from "./data/metalfog-m-1/specs.json";

import * as USCleanerMR1 from "./data/uscleaner-m-1/specs.json";

import * as SmoothitMR1 from "./data/smoothit-m-1/specs.json";
import * as SmoothitMR2 from "./data/smoothit-m-2/specs.json";
import * as SmoothitMR3 from "./data/smoothit-m-3/specs.json";

export const Machines: Record<`${ConfigModel}-${ConfigVariant}-${number}`, MachineSpecs | undefined> = {

    "metalfog-m-0": MetalfogMR0,
    "metalfog-m-1": MetalfogMR1,

    "uscleaner-m-1": USCleanerMR1,

    "smoothit-m-1": SmoothitMR1,
    "smoothit-m-2": SmoothitMR2,
    "smoothit-m-3": SmoothitMR3

};