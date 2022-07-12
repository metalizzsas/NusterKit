import { EIOGateNames } from "./gates/IIOGate";

export interface IPassive
{
    name: string;
    target: number;

    sensors: EIOGateNames | EIOGateNames[];

    actuators: {
        plus: EIOGateNames | EIOGateNames[],
        minus?: EIOGateNames | EIOGateNames[]
    };

    //manual mode requirement
    manualModes?: string | string[];
}