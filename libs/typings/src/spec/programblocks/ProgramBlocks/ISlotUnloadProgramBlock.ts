import { IStringParameterBlock } from "../../cycle/IParameterBlock";
import { IProgramBlock } from "../../cycle/IProgramBlock";


export interface ISlotUnloadProgramBlock extends IProgramBlock {
    name: "slotUnload";
    params: [IStringParameterBlock];
}
