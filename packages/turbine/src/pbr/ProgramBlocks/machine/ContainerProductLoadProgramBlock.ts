import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { SlotController } from "../../../controllers/slot/SlotController";
import { LoggerInstance } from "../../../app";
import { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { EProductSeries } from "@metalizzsas/nuster-typings/build/spec/slot/products";
import type { AllProgramBlocks, ContainerProductLoadProgramBlock as ContainerProductLoadProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlocks";
import type { StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";

export class ContainerProductLoadProgramBlock extends ProgramBlockHydrated
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
        const containerProductSeries = this.containerProductSeries.data as EProductSeries;
        LoggerInstance.info("SlotLoadBlock: Will load slot with name: " + containerName);

        //TODO: not use Singleton
        SlotController.getInstance().slots.find(s => s.name == containerName)?.loadSlot(containerProductSeries);

        super.execute();
    }

    static isContainterProductLoadPgB(obj: AllProgramBlocks): obj is ContainerProductLoadProgramBlockSpec
    {
        return (obj as ContainerProductLoadProgramBlockSpec).load_container !== undefined;
    }
}