import { IStringParameterBlock } from "../../IParameterBlock";
import { IProgramBlock } from "../../IProgramBlock";


export interface ISlotUnloadProgramBlock extends IProgramBlock {
    name: "slotUnload";
    params: [IStringParameterBlock];
}
