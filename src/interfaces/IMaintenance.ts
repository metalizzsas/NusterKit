/** Maintenance configuration base object */
export interface IConfigMaintenance extends IMaintenance
{
    /** Duration type of this maintenance task */
    durationType: string;
    /** Duration limit of this maintenance task */
    durationLimit: number;

    /** Maintenance procedure */
    procedure?: IMaintenanceProcedure;
}

/** Maintenance task object stored in database */
export interface IMaintenance
{
    /** Maintenance task name */
    name: string;
    /** Maintenance task duration */
    duration?: number;
    /** Last operation date */
    operationDate?: number;
}

export interface IMaintenanceProcedure
{
    /** Procedure Tools used */
    tools: string[];
    /** Array of procedure steps */
    steps: IMaintenanceProcedureStep[]
}

export interface IMaintenanceProcedureStep
{
    /** Procedure step name */
    name: string;
    /** Procedure step media array */
    media: string[]
}