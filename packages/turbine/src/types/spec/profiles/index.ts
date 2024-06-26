/** Profile schema from configuration */
interface Profile {

    /**
     * Profile UUID
     * @pattern ^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$
     */
    id: string;

    /** Name of the profile */
    name: string;

    /** Name of the referencing skeleton profile */
    skeleton: string;

    /** Values of the profile */
    values: { key: string, value: number }[];
}

interface ProfileSkeleton {
    
    /** Identifier name of the skeleton */
    name: string;
    /** Fields definitions contained by this skeleton */
    fields: ProfileSkeletonFields[]
}

/** Base profile skeletons fields types */
type ProfileSkeletonFields = (IProfileSkeletonFieldFloat | IProfileSkeletonFieldBoolean | IProfileSkeletonFieldNumber | IProfileSkeletonFieldTime | IProfileSkeletonFieldIncremental) & IProfileSkeletonField;

interface IProfileSkeletonField
{
    /** Name of the profile field can be splitted by category using a #. `ex: temperature#target` */
    name: string;
    /** Type of the profile field */
    type: "bool" | "float" | "int" | "incremental" | "time";
    /** Value contained byt the profile field */
    value: number;

    /** Unity of the profile field, it used for UI purposes only */
    unity?: string;

    /** Is Profile Field hidden */
    detailsShown?: boolean;
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

type IProfileSkeletonFieldIncremental = IProfileSkeletonField & {
    type: "incremental",
    value: number,

    baseValue: number,
    incrementalRangeMin: number,
    incrementalRangeMax: number
}

/** Time profile field type */
interface IProfileSkeletonFieldTime extends IProfileSkeletonField
{
    type: "time";
    units: ("hours" | "minutes" | "seconds" | "milliseconds")[]
    value: number;
}

export { Profile, ProfileSkeleton, ProfileSkeletonFields };