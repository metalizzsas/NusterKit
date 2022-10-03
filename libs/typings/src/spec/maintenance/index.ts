/** Maintenance configuration base object */
export interface IConfigMaintenance
{
    /** Maintenance task name */
    name: string;
    /** Duration type of this maintenance task */
    durationType: string;
    /** Duration limit of this maintenance task */
    durationLimit: number;

    /** Maintenance procedure */
    procedure?: IMaintenanceProcedure;
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