import { INumericParameterBlock, IStringParameterBlock } from "../../IParameterBlock";
import { IProgramBlock } from "../../IProgramBlock";


export interface IMaintenanceProgramBlock extends IProgramBlock {
    name: "maintenance";
    params: [IStringParameterBlock, INumericParameterBlock];
}
