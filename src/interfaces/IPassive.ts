export interface IPassive
{
    name: string;
    target: number;

    sensors: string | string[];

    actuators: {
        plus: string | string[],
        minus?: string | string[]
    };

    //manual mode requirement
    manualModes?: string | string[];
}