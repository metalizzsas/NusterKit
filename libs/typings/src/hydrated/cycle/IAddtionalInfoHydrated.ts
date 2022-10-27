import { IAdditionalInfo } from "../../spec/cycle/IAdditionalInfo";
import { IOGates } from "../../spec/iogates";

export type IAdditionalInfoHydrated = Omit<IAdditionalInfo, "value"> & {
    value: IOGates
}