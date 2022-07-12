import { IStringParameterBlock } from "../../IParameterBlock";
import { IProgramBlock } from "../../IProgramBlock";


export interface ISlotLoadProgramBlock extends IProgramBlock {
    name: "slotLoad";
    params: [IStringParameterBlock];
}
