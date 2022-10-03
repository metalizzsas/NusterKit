import { INumericParameterBlock, IStringParameterBlock } from "../../../spec/cycle/IParameterBlock";

export type INumericParameterBlockHydrated = INumericParameterBlock & {
    data?: number;
}

export type IStringParameterBlockHydrated = IStringParameterBlock & {
    data?: string;
}

export type IParameterBlocksHydrated = IStringParameterBlockHydrated | INumericParameterBlockHydrated;
