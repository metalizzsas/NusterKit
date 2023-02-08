import type { ContainerRegulationHydrated } from "@metalizzsas/nuster-typings/build/hydrated/containers";
import { StatusParameterBlock } from "../StatusParameterBlock";
import type { AllParameterBlocks, RegulationStatusParameterBlock as RegulationStatusParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";
import { TurbineEventLoop } from "../../../events";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";

export class RegulationStatusParameterBlock extends StatusParameterBlock
{
    #containerRegulation?: ContainerRegulationHydrated;

    constructor(obj: RegulationStatusParameterBlockSpec)
    {
        super(obj);

        const containerName = ParameterBlockRegistry.String(obj.regulation_status[0]);
        const containerRegulationName = ParameterBlockRegistry.String(obj.regulation_status[1]);

        TurbineEventLoop.emit(`container.${containerName.data}.regulation.${containerRegulationName.data}.read`, { callback: (containerRegulation) => {
            this.#containerRegulation = containerRegulation;
        }});

        TurbineEventLoop.on(`container.${containerName.data}.regulation.${containerRegulationName.data}.updated`, (containerRegulation) => {
            this.#containerRegulation = containerRegulation;
        });
    }

    get data() {

        if(this.#containerRegulation === undefined)
            return "error";

        if(this.#containerRegulation.state === false)
            return "good";

        return (this.#containerRegulation.target >= this.#containerRegulation.current) ? "good" : "warning";
    }

    static isRegulationStatusPB(obj: AllParameterBlocks): obj is RegulationStatusParameterBlockSpec
    {
        return (obj as RegulationStatusParameterBlockSpec).regulation_status !== undefined;
    }
}