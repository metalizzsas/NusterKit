export interface IConfigSlot
{
    name: string;
    type: string;
    isProductable: boolean;

    sensors: ISlotSensor[];
}

export interface ISlotSensor
{
    io: string;
    type: string;
    value?: number;
}