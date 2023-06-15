import type { StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, ProfileParameterBlock as ProfileParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import type { ProfileHydrated } from "@metalizzsas/nuster-typings/build/hydrated/profiles";
import { NumericParameterBlock } from "../NumericParameterBlock";
import type { ProfileSkeleton } from "@metalizzsas/nuster-typings/build/spec/profiles";
import type { MachineSpecs } from "@metalizzsas/nuster-typings";

export class ProfileParameterBlock extends NumericParameterBlock
{
    private profileRow: StringParameterBlockHydrated;

    #profile?: ProfileHydrated;
    #profileSkeleton?: ProfileSkeleton;

    constructor(obj: ProfileParameterBlockSpec)
    {
        super(obj);
        this.profileRow = ParameterBlockRegistry.String(obj.profile);

        TurbineEventLoop.emit("pbr.profile.read", ({ callback: (profile) => {
            this.#profile = profile;

            TurbineEventLoop.emit("machine.config", (config: MachineSpecs) => {
                this.#profileSkeleton = config.profileSkeletons.find(p => p.name === this.#profile?.skeleton);
            });
        }}));
    }

    public get data(): number
    {
        const profileRowData = this.profileRow.data;

        if(this.#profile === undefined || this.#profileSkeleton === undefined)
        {
            TurbineEventLoop.emit("log", "warning", "Profile: profile not defined, returning 0");
            return 0;
        }

        const val = this.#profile.values.find(v => v.name == profileRowData);
        const profileSkeletonRow = this.#profileSkeleton.fields.find(r => r.name === profileRowData);

        if(val === undefined || profileSkeletonRow === undefined)
        {
            TurbineEventLoop.emit("log", "warning", `Profile: profile row ${profileRowData} not defined returning 0`);
            return 0;
        }

        if(profileSkeletonRow.type === "incremental")
            return profileSkeletonRow.baseValue + val.value;

        if(typeof val === "boolean")
            return val ? 1 : 0;
            
        return val.value;
    } 

    static isProfilePB(obj: AllParameterBlocks): obj is ProfileParameterBlockSpec
    {
        return (obj as ProfileParameterBlockSpec).profile !== undefined;
    }
}

