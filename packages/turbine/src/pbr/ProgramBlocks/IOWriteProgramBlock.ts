import { IIOProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IIOProgramBlock";
import { LoggerInstance } from "../../app";
import { IOController } from "../../controllers/io/IOController";
import { NumericParameterBlocks, StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { ProgramBlock } from "./index";

export class IOWriteProgramBlock extends ProgramBlock implements IIOProgramBlock
{
    name = "io" as const;

    params: [StringParameterBlocks, NumericParameterBlocks];


    constructor(obj: IIOProgramBlock) {
        super(obj);

        this.params = [
            ParameterBlockRegistry(obj.params[0]) as StringParameterBlocks, 
            ParameterBlockRegistry(obj.params[1]) as NumericParameterBlocks 
        ];
    }

    public async execute(): Promise<void> {
        const gateName = this.params[0].data();
        const gateValue = this.params[1].data();

        LoggerInstance.info(`IOAccessBlock: Will access ${gateName} to write ${gateValue}`);

        const gate = IOController.getInstance().gFinder(gateName);

        if(gate)
            await gate.write(gateValue);

        this.executed = true;
    }
}