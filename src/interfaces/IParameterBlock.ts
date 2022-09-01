import { ISlotProductStatusParameterBlock } from "../pbr/ParameterBlocks/SlotProductInformationParameterBlock";
import { IAdditionParameterBlock } from "./programblocks/ParameterBlocks/IAdditionParameterBlock";
import { IConditionalParameterBlock } from "./programblocks/ParameterBlocks/IConditionalParameterBlock";
import { IConstantParameterBlock } from "./programblocks/ParameterBlocks/IConstantParameterBlock";
import { IConstantStringParameterBlock } from "./programblocks/ParameterBlocks/IConstantStringParameterBlock";
import { IIOReadParameterBlock } from "./programblocks/ParameterBlocks/IIOReadParameterBlock";
import { IMaintenanceParameterBlock } from "./programblocks/ParameterBlocks/IMaintenanceParameterBlock";
import { IMultiplyParameterBlock } from "./programblocks/ParameterBlocks/IMultiplyParameterBlock";
import { IProfileParameterBlock } from "./programblocks/ParameterBlocks/IProfileParameterBlock";
import { IReverseParameterBlock } from "./programblocks/ParameterBlocks/IReverseParameterBlock";
import { ISlotLifetimeParameterBlock } from "./programblocks/ParameterBlocks/ISlotLifetimeParameterBlock";
import { IVariableParameterBlock } from "./programblocks/ParameterBlocks/IVariableParameterBlock";

/** Base parameter blocks names */
export type ParameterBlockNames = "default" | "const" | "conststr" | "profile" | "io" | "add" | "multiply" | "reverse" | "conditional" | "variable" | "slotlife" | "slotstatus" | "maintenance";

/** Base parameter block */
export interface IParameterBlock
{
    /** Parameter block name */
    name: ParameterBlockNames;
    
    /** Value from this parameter block */
    value?: string | number;

    /** Parameter block sub parameters blocks */
    params?: IParameterBlocks[]
}

export type IParameterBlockTypes = IProfileParameterBlock | 
IConstantParameterBlock | 
IIOReadParameterBlock |
IAdditionParameterBlock | 
IMultiplyParameterBlock |
IReverseParameterBlock |
IConditionalParameterBlock |
IVariableParameterBlock |
ISlotLifetimeParameterBlock |
IMaintenanceParameterBlock | ISlotProductStatusParameterBlock |
IConstantStringParameterBlock;

/** All the parameters blocks */
export type IParameterBlocks = INumericParameterBlock | IStringParameterBlock;

/** Parameter Blocks that return a number from data() */
export type INumericParameterBlock = (
    IProfileParameterBlock | 
    IConstantParameterBlock | 
    IIOReadParameterBlock |
    IAdditionParameterBlock | 
    IMultiplyParameterBlock |
    IReverseParameterBlock |
    IConditionalParameterBlock |
    IVariableParameterBlock |
    ISlotLifetimeParameterBlock |
    IMaintenanceParameterBlock
);

/** Parameters Blocks that return a string value from data() */
export type IStringParameterBlock = (
    ISlotProductStatusParameterBlock |
    IConstantStringParameterBlock
);