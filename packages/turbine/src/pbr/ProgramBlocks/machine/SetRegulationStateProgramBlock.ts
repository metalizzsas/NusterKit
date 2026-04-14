import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllProgramBlocks, SetRegulationStateProgramBlock as SetRegulationStateProgramBlockSpec } from "$types/spec/cycle/program";
import type { PBRContext } from "../../../services/PBRContext";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import { ProgramBlock } from "../ProgramBlock";

export class SetRegulationStateProgramBlock extends ProgramBlock 
{
    container: StringParameterBlockHydrated;
    regulation: StringParameterBlockHydrated;
    state: NumericParameterBlockHydrated

    constructor(obj: SetRegulationStateProgramBlockSpec, ctx?: PBRContext)
    {
        super(obj, ctx);
        this.container = ParameterBlockRegistry.String(obj.set_regulation_state.container);
        this.regulation = ParameterBlockRegistry.String(obj.set_regulation_state.regulation);
        this.state = ParameterBlockRegistry.Numeric(obj.set_regulation_state.state);
    }

    public async execute(): Promise<void>
    {
        const containerName = this.container.data;
        const regulationName = this.regulation.data;
        const targetState = this.state.data === 1;

        if (this.ctx) {
            this.ctx.logger.log("info", `RegulationSetStateProgramBlock: Will set ${containerName} regulation ${regulationName} to ${targetState}.`);
            const result = await this.ctx.containers.setRegulationState(containerName, regulationName, targetState);
            this.ctx.logger.log("info", `RegulationSetStateProgramBlock: Set ${containerName} regulation ${regulationName} to ${result}.`);
        } else {
            TurbineEventLoop.emit("log", "info", `RegulationSetStateProgramBlock: Will set ${containerName} regulation ${regulationName} to ${targetState}.`);
            TurbineEventLoop.emit(`container.${containerName}.regulation.${regulationName}.set_state`, { state: targetState, callback: (state: boolean) => {
                TurbineEventLoop.emit("log", "info", `RegulationSetStateProgramBlock: Set ${containerName} regulation ${regulationName} to ${state}.`);
            }});
        }

        super.execute();
    }

    static isSetRegulationStatePB(obj: AllProgramBlocks): obj is SetRegulationStateProgramBlockSpec
    {
        return (obj as SetRegulationStateProgramBlockSpec).set_regulation_state !== undefined; 
    }
}

