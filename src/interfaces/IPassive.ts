export interface IPassive
{
    name: string;
    mode: string;
    default: number;

    //gates
    sensor: string;
    actuator: string;
}