import type { IRegulationProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IRegulationProgramBlock";
import { ProgramBlock } from ".";
import { LoggerInstance } from "../../app";
import { SlotController } from "../../controllers/slot/SlotController";
import type { NumericParameterBlocks, StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";

export class RegulationProgramBlock extends ProgramBlock implements IRegulationProgramBlock
{
    name = "regulation" as const;

    params: [StringParameterBlocks, StringParameterBlocks, NumericParameterBlocks, NumericParameterBlocks];

    constructor(obj: IRegulationProgramBlock)
    {
        super(obj);

        this.params = [
            ParameterBlockRegistry(obj.params[0]) as StringParameterBlocks, 
            ParameterBlockRegistry(obj.params[1]) as StringParameterBlocks, 
            ParameterBlockRegistry(obj.params[2]) as NumericParameterBlocks,
            ParameterBlockRegistry(obj.params[3]) as NumericParameterBlocks
        ];
    }

    public async execute(): Promise<void> {

        const slotName = this.params[0].data() as string;
        const slotSensorName = this.params[1].data() as string;


        const slotSensor = SlotController.getInstance().slots.find(s => s.name == slotName)?.sensors?.find(ss => ss.io == slotSensorName)

        if(slotSensor)
        {
            slotSensor.regulationSetState(this.params[2].data() == 1, false);
            slotSensor.regulationSetTarget(this.params[3].data());

            LoggerInstance.info(`Regulation: Setting ${this.params[0].data()}:${this.params[1].data()} state to ${this.params[2].data()} and target to ${this.params[3].data()}`);
        }

        this.executed = true;
    }
}