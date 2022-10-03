/** Profile schema from configuration */
export interface IProfileConfig {

    /** Name of the profile */
    name: string;
    /** Name of the referencing skeleton profile */
    skeleton: string;

    /** Is the profile premade ? */
    isPremade?: true;
    /** Is the profile Removable ? */
    isRemovable?: true;
    /** 
     * Is the profile Overwritable ?
     * @deprecated whats the use case ?
     */
    isOverwritable?: false;

    /** Values of the profile */
    values: Record<string, number>
}

export interface IProfileSkeleton {
    /** Identifier name of the skeleton */
    name: string;
    /** Fields definitions contained by this skeleton */
    fields: ProfileSkeletonFields[]
}


/** Base profile types */
export type ProfileSkeletonFields = (IProfileSkeletonFieldFloat | IProfileSkeletonFieldBoolean | IProfileSkeletonFieldNumber | IProfileSkeletonFieldTime) & IProfileSkeletonField;

interface IProfileSkeletonField
{
    /** Name of the profile field can be splitted by category using a #. `ex: temperature#target` */
    name: string;
    /** Type of the profile field */
    type: "bool" | "float" | "int" | "time";
    /** Value contained byt the profile field */
    value: number;

    /** Unity of the profile field, it used for UI purposes only */
    unity?: string;
}

/** Float ProfileField type */
interface IProfileSkeletonFieldFloat extends IProfileSkeletonField
{
    type: "float";
    value: number;
    floatMin: number;
    floatMax: number;
    floatStep: number;
}
/** Boolean profile field type */
interface IProfileSkeletonFieldBoolean extends IProfileSkeletonField
{
    type: "bool";
    value: 1 | 0;
}

/** Number profile field type */
interface IProfileSkeletonFieldNumber extends IProfileSkeletonField
{
    type: "int";
    value: number;
}

/** Time profile field type */
interface IProfileSkeletonFieldTime extends IProfileSkeletonField
{
    type: "time";
    units: ("hours" | "minutes" | "seconds" | "milliseconds")[]
    value: number;
}