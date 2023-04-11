import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllProgramBlocks, IOWriteProgramBlock as IOWriteProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ProgramBlocks";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import { ProgramBlock } from "../ProgramBlock";

export class IOWriteProgramBlock extends ProgramBlock
{
    gateName: StringParameterBlockHydrated;
    gateValue: NumericParameterBlockHydrated;

    estimatedRunTime = 0.01; // 10ms io write read time

    constructor(obj: IOWriteProgramBlockSpec) {

        super(obj);

        this.gateName = ParameterBlockRegistry.String(obj.io_write[0]);
        this.gateValue = ParameterBlockRegistry.Numeric(obj.io_write[1]);
    }

    public async execute(): Promise<void> {

        const gateName = this.gateName.data;
        const gateValue = this.gateValue.data;

        TurbineEventLoop.emit("log", "info", `IOWriteBlock: Will access ${gateName} to write ${gateValue}.`);

        await new Promise<void>(resolve => {
            TurbineEventLoop.emit(`io.update.${this.gateName.data}`, { value: gateValue, callback: () => {
                resolve();
            }});

            setTimeout(() => {
                TurbineEventLoop.emit("log", "warning", `IOWriteBlock: ${gateName} write timeout.`);
                TurbineEventLoop.emit("pbr.stop", "controllerError");
                resolve();
            }, 2000);

        });

        super.execute();
    }

    static isIOWritePgB(obj: AllProgramBlocks): obj is IOWriteProgramBlockSpec
    {
        return (obj as IOWriteProgramBlockSpec).io_write !== undefined;
    }
}