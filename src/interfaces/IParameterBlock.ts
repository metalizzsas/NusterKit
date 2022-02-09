export interface IParameterBlock
{
    name: string;
    value: string;

    params?: IParameterBlock[]

    data(): unknown
}