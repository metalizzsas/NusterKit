import type { AllParameterBlocks, NumericParameterBlocks, StatusParameterBlocks, StringParameterBlocks } from "@metalizzsas/nuster-typings/build/spec/cycle/IParameterBlocks";
import type { NumericParameterBlockHydrated, StatusParameterBlockHydrated, StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";

export declare class IParameterBlockRegistry
{
    static Numeric(obj: NumericParameterBlocks): NumericParameterBlockHydrated
    static String(obj: StringParameterBlocks): StringParameterBlockHydrated
    static Status(obj: StatusParameterBlocks): StatusParameterBlockHydrated
    static All(obj: AllParameterBlocks): StringParameterBlockHydrated | StatusParameterBlockHydrated | NumericParameterBlockHydrated
}