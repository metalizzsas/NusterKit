import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import type { AllProgramBlocks, ContainerProductLoadProgramBlock as ContainerProductLoadProgramBlockSpec } from "$types/spec/cycle/program";
import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import { TurbineEventLoop } from "../../../events";
import { ProgramBlock } from "../ProgramBlock";

export class ContainerProductLoadProgramBlock extends ProgramBlock
{
    executed = false;

    containerName: StringParameterBlockHydrated;
    containerProductSeries: StringParameterBlockHydrated;

    constructor(obj: ContainerProductLoadProgramBlockSpec) 
    {
        super(obj);
        this.containerName = ParameterBlockRegistry.String(obj.load_container[0]);
        this.containerProductSeries = ParameterBlockRegistry.String(obj.load_container[1]);
    }

    public async execute(): Promise<void> {
        const containerName = this.containerName.data;
        const containerProductSeries = this.containerProductSeries.data;

        TurbineEventLoop.emit("log", "info", `ContainerLoadBlock: Will load ${containerName} with: ${containerProductSeries}.`)
        TurbineEventLoop.emit(`container.load.${containerName}`, containerProductSeries);

        super.execute();
    }

    static isContainterProductLoadPgB(obj: AllProgramBlocks): obj is ContainerProductLoadProgramBlockSpec
    {
        return (obj as ContainerProductLoadProgramBlockSpec).load_container !== undefined;
    }
}