import { IStringParameterBlock } from "../../cycle/IParameterBlock";
import { IProgramBlock } from "../../cycle/IProgramBlock";


export interface ISlotLoadProgramBlock extends IProgramBlock {
    name: "slotLoad";
    params: [IStringParameterBlock];
}
