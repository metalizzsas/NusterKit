import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { ProgramBlock } from "./index";
import { IStopProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IStopProgramBlock";
import { StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { LoggerInstance } from "../../app";


export class StopProgramBlock extends ProgramBlock implements IStopProgramBlock
{
    name = "stop" as const;
    params: [StringParameterBlocks];

    constructor(pbrInstance: ProgramBlockRunner, obj: IStopProgramBlock)
    {
        super(pbrInstance, obj);

        this.params = [
            ParameterBlockRegistry(pbrInstance, obj.params[0]) as StringParameterBlocks
        ];
    }

    public async execute(): Promise<void> {
        if (process.env.NODE_ENV != "production") {
            LoggerInstance.info("StopBlock: Debug mode will not stop the machine.");
            return;
        }

        this.pbrInstance.end(this.params[0].data());
        this.executed = true;
    }
}

