import type { StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { AllProgramBlocks, ContainerProductUnloadProgramBlock as ContainerProductUnloadProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ProgramBlocks";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";

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

        TurbineEventLoop.emit("log", "info", `SlotUnloadBlock: Will unload slot with name: ${containerName}.`);
        TurbineEventLoop.emit(`container.unload.${containerName}`);

        super.execute();
    }

    static isContainerProductUnloadPgB(obj: AllProgramBlocks): obj is ContainerProductUnloadProgramBlockSpec
    {
        return (obj as ContainerProductUnloadProgramBlockSpec).unload_container!== undefined; 
    }
}

