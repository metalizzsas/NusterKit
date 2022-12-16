import { NumericParameterBlockHydrated, type StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, ProfileParameterBlock as ProfileParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/IParameterBlocks";
import { LoggerInstance } from "../../../app";
import type { ProgramBlockRunner } from "../../ProgramBlockRunner";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";

export class ProfileParameterBlock extends NumericParameterBlockHydrated
{
    private profileRow: StringParameterBlockHydrated;

    constructor(obj: ProfileParameterBlockSpec, pbrInstance?: ProgramBlockRunner)
    {
        super(obj, pbrInstance);
        this.profileRow = ParameterBlockRegistry.String(obj.profile);
    }

    public get data(): number
    {
        const profileRowData = this.profileRow.data;

        if(this.pbrInstance?.profileExplorer !== undefined)
        {
            const val = this.pbrInstance.profileExplorer(profileRowData);
            if(val === undefined) 
            {
                LoggerInstance.warn(`Profile row ${profileRowData} not found, returning 0`);
                return 0;
            }

            if(typeof val === "boolean")
                return val ? 1 : 0;
            
            return val;
        }
        else
        {
            LoggerInstance.warn("Profile not defined, returning 0");
            return 0;
        }
    } 

    static isProfilePB(obj: AllParameterBlocks): obj is ProfileParameterBlockSpec
    {
        return (obj as ProfileParameterBlockSpec).profile !== undefined;
    }
}

