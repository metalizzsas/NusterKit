import type { Addon } from "./addons";
import type { Container } from "./containers";
import type { CyclePremade, ProgramBlockRunner } from "./cycle";
import type { IOGates } from "./iogates";
import type { IOHandlers } from "./iohandlers";
import type { Maintenances } from "./maintenances";
import type { Nuster } from "./nuster"
import type { Profile, ProfileSkeleton } from "./profiles";

/** Machine JSON Specifications */
export declare interface MachineSpecs
{
    /** 
     * Schema used by the configuration file
     * @defaultValue ../../../../node_modules/@metalizzsas/nuster-typings/build/schemas/schema-specs.json
     */
    $schema: string;

    /** Nuster Additional data */
    nuster?: Nuster

    /** Cycle types definition */
    cycleTypes: ProgramBlockRunner[],
    /** Cycle premades definition */
    cyclePremades: CyclePremade[],

    /** IOHandler definitions */
    iohandlers: IOHandlers[];
    /** IOGates definition */
    iogates: IOGates[];

    /** Maintenance tasks definition */
    maintenance: Maintenances[],

    /** Profile skeletons definition */
    profileSkeletons: ProfileSkeleton[],
    /** Premade profile definition */
    profilePremades: Profile[],

    /** Product slots definition */
    containers: Container[],

    /** Supported machine variables */
    variables: string[]

    /** Addons available on this machine */
    addons?: Addon[]
}