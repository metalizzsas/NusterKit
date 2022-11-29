import { ProgramBlock } from "./index";
import type { StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { LoggerInstance } from "../../app";
import { CycleController } from "../../controllers/cycle/CycleController";
import { PBRMissingError } from "../PBRMissingError";
import type { IStopProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IStopProgramBlock";

export class StopProgramBlock extends ProgramBlock implements IStopProgramBlock
{
    name = "stop" as const;
    params: [StringParameterBlocks];

    constructor(obj: IStopProgramBlock)
    {
        super(obj);

        this.params = [
            ParameterBlockRegistry(obj.params[0]) as StringParameterBlocks
        ];
    }

    public async execute(): Promise<void>
    {
        const pbrInstance = CycleController.getInstance().pbrInstance;

        if(pbrInstance !== undefined)
        {
            if (process.env.NODE_ENV != "production") {
                LoggerInstance.warn("StopBlock: Debug mode will not stop the machine.");
                return;
            }
    
            pbrInstance.end(this.params[0].data());
            this.executed = true;
        }
        else
            throw new PBRMissingError("StopPRogram");

    }
}

