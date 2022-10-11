import { INumericParameterBlock, IStringParameterBlock } from "../../cycle/IParameterBlock";
import { IProgramBlock } from "../../cycle/IProgramBlock";


export interface IMaintenanceProgramBlock extends IProgramBlock {
    name: "maintenance";
    params: [IStringParameterBlock, INumericParameterBlock];
}
