import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import type { AllProgramBlocks, ContainerProductLoadProgramBlock as ContainerProductLoadProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ProgramBlocks";
import type { StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import { TurbineEventLoop } from "../../../events";
import type { ProductSeries } from "@metalizzsas/nuster-typings/build/spec/containers/products";
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
        const containerProductSeries = this.containerProductSeries.data as ProductSeries;

        TurbineEventLoop.emit("log", "info", `ContainerLoadBlock: Will load ${containerName} with: ${containerProductSeries}.`)
        TurbineEventLoop.emit(`container.load.${containerName}`, containerProductSeries);

        super.execute();
    }

    static isContainterProductLoadPgB(obj: AllProgramBlocks): obj is ContainerProductLoadProgramBlockSpec
    {
        return (obj as ContainerProductLoadProgramBlockSpec).load_container !== undefined;
    }
}