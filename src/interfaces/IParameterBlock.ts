export interface IParameterBlock
{
    name: EParameterBlockName;
    
    value?: string;
    params?: IParameterBlock[]
}

export enum EParameterBlockName
{
    CONSTANT = "const",
    CONSTANT_STRING = "conststr",
    PROFILE = "profile",
    IO = "io",
    ADD = "add",
    MULTIPLY = "multiply",
    REVERSE = "reverse",
    CONDITIONAL = "conditional",
    VARIABLE = "variable",
    SLOTLIFE = "slotlife",
    SLOTSTATUS = "slotstatus",
    MAINTENANCEPROGRESS = "maintenance"
}