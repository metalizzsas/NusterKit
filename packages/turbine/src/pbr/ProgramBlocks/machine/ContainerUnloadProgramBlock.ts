import type { StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { AllProgramBlocks, ContainerProductUnloadProgramBlock as ContainerProductUnloadProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlocks";
import { LoggerInstance } from "../../../app";
import { SlotController } from "../../../controllers/slot/SlotController";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";

export class ContainerProductUnloadProgramBlock extends ProgramBlockHydrated 
{
    containterName: StringParameterBlockHydrated;

    constructor(obj: ContainerProductUnloadProgramBlockSpec)
    {
        super(obj);
        this.containterName = ParameterBlockRegistry.String(obj.unload_container);
    }

    public async execute(): Promise<void>
    {
        const containerName = this.containterName.data;
        LoggerInstance.info("SlotUnloadBlock: Will unload slot with name: " + containerName);

        SlotController.getInstance().slots.find(s => s.name == containerName)?.unloadSlot();

        super.execute();
    }

    static isContainerProductUnloadPgB(obj: AllProgramBlocks): obj is ContainerProductUnloadProgramBlockSpec
    {
        return (obj as ContainerProductUnloadProgramBlockSpec).unload_container!== undefined; 
    }
}

