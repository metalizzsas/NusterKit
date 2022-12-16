import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { AllProgramBlocks, IOWriteProgramBlock as IOWriteProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlocks";
import { LoggerInstance } from "../../../app";
import { IOController } from "../../../controllers/io/IOController";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";

export class IOWriteProgramBlock extends ProgramBlockHydrated
{
    gateName: StringParameterBlockHydrated;
    gateValue: NumericParameterBlockHydrated;

    estimatedRunTime = 0.05; // 50ms io write read time 

    constructor(obj: IOWriteProgramBlockSpec) {

        super(obj);

        this.gateName = ParameterBlockRegistry.String(obj.io_write[0]);
        this.gateValue = ParameterBlockRegistry.Numeric(obj.io_write[1]);
    }

    public async execute(): Promise<void> {
        const gateName = this.gateName.data;
        const gateValue = this.gateValue.data;

        LoggerInstance.info(`IOAccessBlock: Will access ${gateName} to write ${gateValue}`);

        //TODO: Changeme to avoid singleton instance
        const gate = IOController.getInstance().gFinder(gateName);

        if(gate)
            await gate.write(gateValue);

        super.execute();
    }

    static isIOWritePgB(obj: AllProgramBlocks): obj is IOWriteProgramBlockSpec
    {
        return (obj as IOWriteProgramBlockSpec).io_write !== undefined;
    }
}