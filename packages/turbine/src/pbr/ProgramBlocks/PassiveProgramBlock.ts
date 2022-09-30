import { IPassiveProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IPassiveProgramBlock";
import { ProgramBlock } from ".";
import { LoggerInstance } from "../../app";
import { PassiveController } from "../../controllers/passives/PassiveController";
import { NumericParameterBlocks, StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";

export class PassiveProgramBlock extends ProgramBlock implements IPassiveProgramBlock
{
    name = "passive" as const;

    params: [StringParameterBlocks, NumericParameterBlocks, NumericParameterBlocks];

    constructor(obj: IPassiveProgramBlock)
    {
        super(obj);

        this.params = [
            ParameterBlockRegistry(obj.params[0]) as StringParameterBlocks, 
            ParameterBlockRegistry(obj.params[1]) as NumericParameterBlocks,
            ParameterBlockRegistry(obj.params[2]) as NumericParameterBlocks
        ];
    }

    public async execute(): Promise<void> {
        const passive = PassiveController.getInstance().find(this.params[0].data());

        if(passive)
        {
            passive.toggle(this.params[1].data() == 1, false);
            passive.setTarget(this.params[2].data());

            LoggerInstance.info("Passive: Setting " + this.params[0].data() + " state to " + this.params[1].data() + " and target to " + this.params[2].data());
        }

        this.executed = true;
    }
}