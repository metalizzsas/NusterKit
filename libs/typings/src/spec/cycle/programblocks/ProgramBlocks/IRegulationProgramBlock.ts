import { IStringParameterBlock, INumericParameterBlock } from "../../IParameterBlock";
import { IProgramBlock } from "../../IProgramBlock";

export interface IRegulationProgramBlock extends IProgramBlock
{
    name: "regulation";

    params: [
        IStringParameterBlock, // Slot Name
        IStringParameterBlock, // Slot Sensor Name
        INumericParameterBlock,  // target
        INumericParameterBlock // state
    ];
}