import { IParameterBlock } from "../../interfaces/IParameterBlock";
import { IAdditionParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IAdditionParameterBlock";
import { IConditionalParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IConditionalParameterBlock";
import { IConstantParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IConstantParameterBlock";
import { IConstantStringParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IConstantStringParameterBlock";
import { IIOReadParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IIOReadParameterBlock";
import { IMaintenanceParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IMaintenanceParameterBlock";
import { IMultiplyParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IMultiplyParameterBlock";
import { IProfileParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IProfileParameterBlock";
import { IReverseParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IReverseParameterBlock";
import { ISlotLifetimeParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/ISlotLifetimeParameterBlock";
import { ISlotProductStatusParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/ISlotProductStatusParameterBlock";
import { IVariableParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IVariableParameterBlock";
import { AdditionParameterBlock } from "./AdditionParameterBlock";
import { ConditionalParameterBlock } from "./ConditionalParameterBlock";
import { ConstantParameterBlock } from "./ConstantParameterBlock";
import { ConstantStringParameterBlock } from "./ConstantStringParameterBlock";
import { ParameterBlocks } from "./index";
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
