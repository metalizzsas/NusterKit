import type { IParameterBlock, ParameterBlockNames, IParameterBlocks, INumericParameterBlock, IStringParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/IParameterBlock";
import type { AdditionParameterBlock } from "./AdditionParameterBlock";
import type { ConditionalParameterBlock } from "./ConditionalParameterBlock";
import type { ConstantParameterBlock } from "./ConstantParameterBlock";
import type { ConstantStringParameterBlock } from "./ConstantStringParameterBlock";
import type { IOReadParameterBlock } from "./IOReadParameterBlock";
import type { MaintenanceProgressParameterBlock } from "./MaintenanceParameterBlock";
import type { MultiplyParameterBlock } from "./MultiplyParameterBlock";
import { ParameterBlockRegistry } from "./ParameterBlockRegistry";
import type { ProfileParameterBlock } from "./ProfileParameterBlock";
import type { ReverseParameterBlock } from "./ReverseParameterBlock";
import type { SlotProductStatusParameterBlock } from "./SlotProductInformationParameterBlock";
import type { VariableParameterBlock } from "./VariableParameterBlock";

export class ParameterBlock implements IParameterBlock
{
    name: ParameterBlockNames = "default";

    params?: ParameterBlocks[];
    value?: string | number;

    constructor(obj: IParameterBlock)
    {
        this.name = obj.name;
        this.value = obj.value;

        this.fillParameterBlocks(obj);
    }

    /**
     * 
     * @deprecated
     * @param obj 
     */
    fillParameterBlocks(obj: IParameterBlock)
    {
        if(obj.params !== undefined)
        {
            //if json object interface has parameters, create in this instance. 
            this.params = [];

            for(const p of obj.params)
            {
                this.params.push(ParameterBlockRegistry(p));
            }
        }
    }

    data(): string | number | null
    {
        return null;
    }

    toJSON()
    {
        return{
            name: this.name,
            value: this.value,
            data: this.data()
        }
    }
}

export type ParameterBlocks = (ParameterBlock | NumericParameterBlocks | StringParameterBlocks) & IParameterBlocks;

export type NumericParameterBlocks = (ProfileParameterBlock | ConstantParameterBlock | IOReadParameterBlock | AdditionParameterBlock | MultiplyParameterBlock | ReverseParameterBlock | ConditionalParameterBlock | VariableParameterBlock | MaintenanceProgressParameterBlock) & INumericParameterBlock;
export type StringParameterBlocks = (SlotProductStatusParameterBlock | ConstantStringParameterBlock) & IStringParameterBlock;