import { IParameterBlock } from "./IParameterBlock";

export interface IProgramBlock
{
    name: string;
    params?: IParameterBlock[];
    blocks?: IProgramBlock[];

    executed?: boolean;
}