import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllProgramBlocks, SetRegulationStateProgramBlock as SetRegulationStateProgramBlockSpec } from "$types/spec/cycle/program";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import { ProgramBlock } from "../ProgramBlock";

export class SetRegulationStateProgramBlock extends ProgramBlock 
{
    container: StringParameterBlockHydrated;
    regulation: StringParameterBlockHydrated;
    state: NumericParameterBlockHydrated

    constructor(obj: SetRegulationStateProgramBlockSpec)
    {
        super(obj);
        this.container = ParameterBlockRegistry.String(obj.set_regulation_state.container);
        this.regulation = ParameterBlockRegistry.String(obj.set_regulation_state.regulation);
        this.state = ParameterBlockRegistry.Numeric(obj.set_regulation_state.state);
    }

    public async execute(): Promise<void>
    {
        TurbineEventLoop.emit("log", "info", `RegulationSetStateProgramBlock: Will set ${this.container.data} regulation ${this.regulation.data} to ${this.state.data}.`);
        
        TurbineEventLoop.emit(`container.${this.container.data}.regulation.${this.regulation.data}.set_state`, { state: this.state.data === 1, callback: (state) => {
            TurbineEventLoop.emit("log", "info", `RegulationSetStateProgramBlock: Set ${this.container.data} regulation ${this.regulation.data} to ${state}.`);
        }})

        super.execute();
    }

    static isSetRegulationStatePB(obj: AllProgramBlocks): obj is SetRegulationStateProgramBlockSpec
    {
        return (obj as SetRegulationStateProgramBlockSpec).set_regulation_state !== undefined; 
    }
}

