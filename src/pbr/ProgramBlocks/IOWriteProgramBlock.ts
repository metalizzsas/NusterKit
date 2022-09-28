
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { IIOProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IIOProgramBlock";
import { ProgramBlock } from "./index";
import { StringParameterBlocks, NumericParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";


export class IOWriteProgramBlock extends ProgramBlock implements IIOProgramBlock
{
    name = "io" as const;

    params: [StringParameterBlocks, NumericParameterBlocks];


    constructor(pbrInstance: ProgramBlockRunner, obj: IIOProgramBlock) {
        super(pbrInstance, obj);

        this.params = [
            ParameterBlockRegistry(pbrInstance, obj.params[0]) as StringParameterBlocks, 
            ParameterBlockRegistry(pbrInstance, obj.params[1]) as NumericParameterBlocks 
        ];
    }

    public async execute(): Promise<void> {
        const gateName = this.params[0].data();
        const gateValue = this.params[1].data();

        this.pbrInstance.machine.logger.info(`IOAccessBlock: Will access ${gateName} to write ${gateValue}`);

        const gate = this.pbrInstance.ioExplorer(gateName);

        if(gate)
            await gate.write(gateValue);

        this.executed = true;

    }
}

