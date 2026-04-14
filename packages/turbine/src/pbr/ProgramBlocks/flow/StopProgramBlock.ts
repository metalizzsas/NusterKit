import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import type { AllProgramBlocks, StopProgramBlock as StopProgramBlockSpec } from "$types/spec/cycle/program";
import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { PBRContext } from "../../../services/PBRContext";
import { TurbineEventLoop } from "../../../events";
import { ProgramBlock } from "../ProgramBlock";

export class StopProgramBlock extends ProgramBlock
{
    stopReason: StringParameterBlockHydrated;

    constructor(obj: StopProgramBlockSpec, ctx?: PBRContext)
    {
        super(obj, ctx);
        this.stopReason = ParameterBlockRegistry.String(obj.stop)
    }

    public async execute(): Promise<void>
    {
        if (process.env.NODE_ENV != "production") {
            if (this.ctx) {
                this.ctx.logger.log("warning", "StopBlock: Debug mode will not stop the machine.");
            } else {
                TurbineEventLoop.emit("log", "warning", "StopBlock: Debug mode will not stop the machine.");
            }
            return;
        }

        if (this.ctx) {
            this.ctx.stop(this.stopReason.data);
        } else {
            TurbineEventLoop.emit(`pbr.stop`, this.stopReason.data);
        }

        super.execute();
    }

    static isStopPgB(obj: AllProgramBlocks): obj is StopProgramBlockSpec
    {
        return (obj as StopProgramBlockSpec).stop !== undefined;
    }
}

