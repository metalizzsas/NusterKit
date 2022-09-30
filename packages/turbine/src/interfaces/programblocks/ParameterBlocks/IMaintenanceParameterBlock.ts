import { IParameterBlock } from "../../IParameterBlock";


export interface IMaintenanceParameterBlock extends IParameterBlock {
    name: "maintenance";

    //This value should be indexed from maintenance names
    value: string;
}
