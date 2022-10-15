import type { IParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/IParameterBlock";
import type { IAdditionParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/IAdditionParameterBlock";
import type { IConditionalParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/IConditionalParameterBlock";
import type { IConstantParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/IConstantParameterBlock";
import type { IConstantStringParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/IConstantStringParameterBlock";
import type { IIOReadParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/IIOReadParameterBlock";
import type { IMaintenanceParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/IMaintenanceParameterBlock";
import type { IMultiplyParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/IMultiplyParameterBlock";
import type { IProfileParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/IProfileParameterBlock";
import type { IReverseParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/IReverseParameterBlock";
import type { ISlotLifetimeParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/ISlotLifetimeParameterBlock";
import type { ISlotProductStatusParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/ISlotProductStatusParameterBlock";
import type { IVariableParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/IVariableParameterBlock";

import { AdditionParameterBlock } from "./AdditionParameterBlock";
import { ConditionalParameterBlock } from "./ConditionalParameterBlock";
import { ConstantParameterBlock } from "./ConstantParameterBlock";
import { ConstantStringParameterBlock } from "./ConstantStringParameterBlock";
import type { ParameterBlocks } from "./index";
import { IOReadParameterBlock } from "./IOReadParameterBlock";
import { MaintenanceProgressParameterBlock } from "./MaintenanceParameterBlock";
import { MultiplyParameterBlock } from "./MultiplyParameterBlock";
import { ProfileParameterBlock } from "./ProfileParameterBlock";
import { ReverseParameterBlock } from "./ReverseParameterBlock";
import { SlotLifetimeParameterBlock } from "./SlotLifeParameterBlock";
import { SlotProductStatusParameterBlock } from "./SlotProductInformationParameterBlock";
import { VariableParameterBlock } from "./VariableParameterBlock";

/**
 * Defines Parameter block properly from configuration object
 * @param pbrInstance PBRInstance to attach blocks to it
 * @param obj IParameter json object extracted from configuration file
 * @returns Parameter block defined properly
 */

export function ParameterBlockRegistry(obj: IParameterBlock): ParameterBlocks {
    switch (obj.name) {
        case "const": return new ConstantParameterBlock(obj as IConstantParameterBlock);
        case "conststr": return new ConstantStringParameterBlock(obj as IConstantStringParameterBlock);
        case "profile": return new ProfileParameterBlock(obj as IProfileParameterBlock);
        case "io": return new IOReadParameterBlock(obj as IIOReadParameterBlock);
        case "add": return new AdditionParameterBlock(obj as IAdditionParameterBlock);
        case "multiply": return new MultiplyParameterBlock(obj as IMultiplyParameterBlock);
        case "reverse": return new ReverseParameterBlock(obj as IReverseParameterBlock);
        case "conditional": return new ConditionalParameterBlock(obj as IConditionalParameterBlock);
        case "variable": return new VariableParameterBlock(obj as IVariableParameterBlock);
        case "slotlife": return new SlotLifetimeParameterBlock(obj as ISlotLifetimeParameterBlock);
        case "slotstatus": return new SlotProductStatusParameterBlock(obj as ISlotProductStatusParameterBlock);
        case "maintenance": return new MaintenanceProgressParameterBlock(obj as IMaintenanceParameterBlock);

        default: return new ConstantParameterBlock({name: "const", value: 0});
    }
}
