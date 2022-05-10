import { IParameterBlock } from "./IParameterBlock";

export interface IProgramBlock
{
    name: EProgramBlockName;
    params?: IParameterBlock[];
    blocks?: IProgramBlock[];

    executed?: boolean;
}

export enum EProgramBlockName {
    FOR = "for",
    WHILE = "while",
    IF = "if",
    SLEEP = "sleep",
    IO = "io",
    MAINTENANCE = "maintenance",
    STOP = "stop",
    VARIABLE = "variable",
    STARTTIMER = "startTimer",
    STOPTIMER = "stopTimer",
    GROUP = "group"
}