import type { StatusParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { IPBRStartCondition } from "@metalizzsas/nuster-typings/build/spec/cycle/security/IPBRStartCondition";
import type { IOGates } from "@metalizzsas/nuster-typings/build/spec/iogates";
import { IOController } from "../../controllers/io/IOController";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";

export class PBRStartConditionCheck
{
    private startcondition: IPBRStartCondition["checkchain"];

    private gate?: IOGates;
    private statusBlock?: StatusParameterBlockHydrated;

    constructor(sc: IPBRStartCondition["checkchain"])
    {
        this.startcondition = sc;

        if(sc.io !== undefined)
        {
            this.gate = IOController.getInstance().gFinder(sc.io?.gateName);
        }

        if(sc.parameter)
        {
            this.statusBlock = ParameterBlockRegistry.Status(sc.parameter);
        }
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