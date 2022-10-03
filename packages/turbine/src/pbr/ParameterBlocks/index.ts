import { IParameterBlock, ParameterBlockNames, IParameterBlocks, INumericParameterBlock, IStringParameterBlock } from "@metalizz/nuster-typings/src/spec/cycle/IParameterBlock";
import { AdditionParameterBlock } from "./AdditionParameterBlock";
import { ConditionalParameterBlock } from "./ConditionalParameterBlock";
import { ConstantParameterBlock } from "./ConstantParameterBlock";
import { ConstantStringParameterBlock } from "./ConstantStringParameterBlock";
import { IOReadParameterBlock } from "./IOReadParameterBlock";
import { MaintenanceProgressParameterBlock } from "./MaintenanceParameterBlock";
import { MultiplyParameterBlock } from "./MultiplyParameterBlock";
import { ParameterBlockRegistry } from "./ParameterBlockRegistry";
import { ProfileParameterBlock } from "./ProfileParameterBlock";
import { ReverseParameterBlock } from "./ReverseParameterBlock";
import { SlotLifetimeParameterBlock } from "./SlotLifeParameterBlock";
import { SlotProductStatusParameterBlock } from "./SlotProductInformationParameterBlock";
import { VariableParameterBlock } from "./VariableParameterBlock";

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

export type NumericParameterBlocks = (ProfileParameterBlock | ConstantParameterBlock | IOReadParameterBlock | AdditionParameterBlock | MultiplyParameterBlock | ReverseParameterBlock | ConditionalParameterBlock | VariableParameterBlock | SlotLifetimeParameterBlock | MaintenanceProgressParameterBlock) & INumericParameterBlock;
export type StringParameterBlocks = (SlotProductStatusParameterBlock | ConstantStringParameterBlock) & IStringParameterBlock;