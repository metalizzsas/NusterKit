import { ProgramBlock } from ".";
import { IPassiveProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IPassiveProgramBlock";
import { NumericParameterBlocks, StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { ProgramBlockRunner } from "../ProgramBlockRunner";

export class PassiveProgramBlock extends ProgramBlock implements IPassiveProgramBlock
{
    name: "passive" = "passive";

    params: [StringParameterBlocks, NumericParameterBlocks, NumericParameterBlocks];

    constructor(pbrInstance: ProgramBlockRunner, obj: IPassiveProgramBlock)
    {
        super(pbrInstance, obj);

        this.params = [
            ParameterBlockRegistry(pbrInstance, obj.params[0]) as StringParameterBlocks, 
            ParameterBlockRegistry(pbrInstance, obj.params[1]) as NumericParameterBlocks,
            ParameterBlockRegistry(pbrInstance, obj.params[2]) as NumericParameterBlocks
        ];
    }

    public async execute(): Promise<void> {
        const passive = this.pbrInstance.machine.passiveController.find(this.params[0].data());

        if(passive)
        {
            passive.toggle(this.params[1].data() == 1, false);
            passive.setTarget(this.params[2].data());

            this.pbrInstance.machine.logger.info("Passive: Setting " + this.params[0].data() + " state to " + this.params[1].data() + " and target to " + this.params[2].data());
        }
    }
}