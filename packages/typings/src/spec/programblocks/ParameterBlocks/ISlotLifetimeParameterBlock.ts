import { IParameterBlock } from "../../cycle/IParameterBlock";


export interface ISlotLifetimeParameterBlock extends IParameterBlock {
    name: "slotlife";
    value: string;
}
