import type { AllParameterBlocks, NumericParameterBlocks, StatusParameterBlocks, StringParameterBlocks } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";
import type { NumericParameterBlockHydrated, StatusParameterBlockHydrated, StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";

import { SubParameterBlock } from "./math/SubParameterBlock";
import { StringParameterBlock } from "./var/StringParameterBlock";
import { NumberParameterBlock } from "./var/NumberParameterBlock";
import { AddParameterBlock } from "./math/AddParameterBlock";
import { DivideParameterBlock } from "./math/DivideParameterBlock";
import { MultiplyParameterBlock } from "./math/MultiplyParameterBlock";
import { ReverseParameterBlock } from "./math/ReverseParameterBlock";
import { ConditionalParameterBlock } from "./math/ConditionalParameterBlock";
import { ReadVariableParameterBlock } from "./var/ReadVariableParameterBlock";
import { IOReadParameterBlock } from "./machine/IOReadParameterBlock";
import { MaintenanceStatusParameterBlock } from "./machine/MaintenanceStatusParameterBlock";
import { ProfileParameterBlock } from "./machine/ProfileParameterBlock";
import { ProductStatusParameterBlock } from "./machine/ProductStatusParameterBlock";
import { ReadMachineVariableParameterBlock } from "./var/ReadMachineVariableBlock";

/**
 * Parameter Block Registry
 * @desc Creates parameter blocks from their non hydrated form
 */
export class ParameterBlockRegistry
{
    /**
     * Creates numeric parameters blocks
     * @param obj non hydrated source object
     * @returns Numeric parameter block hydrated
     */
    static Numeric(obj: NumericParameterBlocks): NumericParameterBlockHydrated
    {
        if(typeof obj === "number") return new NumberParameterBlock({"number": obj});
        if(NumberParameterBlock.isNumberPB(obj)) return new NumberParameterBlock(obj);

        if(ReadVariableParameterBlock.isReadVariablePB(obj)) return new ReadVariableParameterBlock(obj);

        if(AddParameterBlock.isAddPB(obj)) return new AddParameterBlock(obj);
        if(MultiplyParameterBlock.isMultiplyPB(obj)) return new MultiplyParameterBlock(obj);

        if(SubParameterBlock.isSubPB(obj)) return new SubParameterBlock(obj);
        if(DivideParameterBlock.isDividePB(obj)) return new DivideParameterBlock(obj);
        if(ReverseParameterBlock.isReversePB(obj)) return new ReverseParameterBlock(obj);

        if(ProfileParameterBlock.isProfilePB(obj)) return new ProfileParameterBlock(obj);

        if(IOReadParameterBlock.isIOReadPB(obj)) return new IOReadParameterBlock(obj);

        if(ConditionalParameterBlock.isConditionalPB(obj)) return new ConditionalParameterBlock(obj);

        if(ReadMachineVariableParameterBlock.isReadMachineVariablePB(obj)) return new ReadMachineVariableParameterBlock(obj);

        throw Error("ParameterBlock data is not compatible with Numeric ParameterBlock");
    }

    /**
     * Creates string parameters blocks
     * @param obj Non hydrated source object
     * @returns String parameter block hydrated
     */
    static String(obj: StringParameterBlocks): StringParameterBlockHydrated
    {
        if(typeof obj === "string") return new StringParameterBlock({"string": obj});
        if(StringParameterBlock.isStringPB(obj)) return new StringParameterBlock(obj);

        throw Error("ParameterBlock data is not compatible with String ParameterBlock");
    }

    /**
     * Creates status parameters blocks
     * @param obj Non hydrated source objects
     * @returns Status parameter block hydrated
     */
    static Status(obj: StatusParameterBlocks): StatusParameterBlockHydrated
    {
        if(MaintenanceStatusParameterBlock.isMaintenanceStatusPB(obj)) return new MaintenanceStatusParameterBlock(obj);
        if(ProductStatusParameterBlock.isProductStatusPB(obj)) return new ProductStatusParameterBlock(obj);

        throw Error("ParameterBlock data is not compatible with Status ParameterBlock");
    }

    /** Tries to generate a program block that its type is unknown */
    static All(obj: AllParameterBlocks): StringParameterBlockHydrated | StatusParameterBlockHydrated | NumericParameterBlockHydrated
    {
        try 
        {
            return this.Numeric(obj as NumericParameterBlocks);
        }
        catch(ex)
        {
            try
            {
                return this.String(obj as StringParameterBlocks);
            }
            catch(ex)
            {
                try
                {
                    return this.Status(obj as StatusParameterBlocks);
                }
                catch(ex)
                {
                    throw Error("Failed to created the parameter block");
                }
            }
        }
    }
}