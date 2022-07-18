
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { IIOProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IIOProgramBlock";
import { ProgramBlock } from "./index";
import { StringParameterBlocks, NumericParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";


export class IOWriteProgramBlock extends ProgramBlock implements IIOProgramBlock
{
    name: "io" = "io";

    params: [StringParameterBlocks, NumericParameterBlocks];


    constructor(pbrInstance: ProgramBlockRunner, obj: IIOProgramBlock) {
        super(pbrInstance, obj);

        this.params = [
            ParameterBlockRegistry(pbrInstance, obj.params[0]) as StringParameterBlocks, 
            ParameterBlockRegistry(pbrInstance, obj.params[1]) as NumericParameterBlocks 
        ];
    }

    public async execute(): Promise<void> {
        const gN = this.params[0].data();
        const gV = this.params[1].data();

        this.pbrInstance.machine.logger.info(`IOAccessBlock: Will access ${gN} to write ${gV}`);

        const gate = this.pbrInstance.ioExplorer(gN);

        if(gate)
            await gate.write(this.pbrInstance.machine.ioController, gV);

        this.executed = true;

    }
}

