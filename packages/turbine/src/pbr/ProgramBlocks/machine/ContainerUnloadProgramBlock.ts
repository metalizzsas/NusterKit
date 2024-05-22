import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllProgramBlocks, ContainerProductUnloadProgramBlock as ContainerProductUnloadProgramBlockSpec } from "$types/spec/cycle/program";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import { ProgramBlock } from "../ProgramBlock";

export class ContainerProductUnloadProgramBlock extends ProgramBlock 
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

