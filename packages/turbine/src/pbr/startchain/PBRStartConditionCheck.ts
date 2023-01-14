import type { StatusParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { PBRStartCondition } from "@metalizzsas/nuster-typings/build/spec/cycle/PBRStartCondition";

import { TurbineEventLoop } from "../../events";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import type { IOGateJSON } from "@metalizzsas/nuster-typings/build/hydrated/io";

export class PBRStartConditionCheck
{
    private startcondition: PBRStartCondition["checkchain"];

    private gate?: IOGateJSON;
    private statusBlock?: StatusParameterBlockHydrated;

    constructor(sc: PBRStartCondition["checkchain"])
    {
        this.startcondition = sc;

        if(sc.io !== undefined)
            TurbineEventLoop.on(`io.updated.${sc.io.gateName}`, (gate) => this.gate = gate);
        else if(sc.parameter)
            this.statusBlock = ParameterBlockRegistry.Status(sc.parameter);
    }

    check(): "error" | "warning" | "good" 
    {
        if(this.startcondition.io && this.gate)
            return this.gate.value == this.startcondition.io.gateValue ? "good" : "error";

        if(this.startcondition.parameter && this.statusBlock)
            return this.statusBlock.data;

        return "error";
    }
}