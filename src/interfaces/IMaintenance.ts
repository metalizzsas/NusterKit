export interface IConfigMaintenance extends IMaintenance
{
    durationType: string;
    durationLimit: number;

    procedure?: IMaintenanceProcedure;
}

export interface IMaintenance
{
    name: string;
    duration?: number;
    operationDate?: number;
}

export interface IMaintenanceProcedure
{
    tools: string[];
    steps: IMaintenanceProcedureStep[]
}

export interface IMaintenanceProcedureStep
{
    name: string;
    media: string[]
}