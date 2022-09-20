export interface IPassive
{
    /** If a passive mode is internal, it means that it is hidden from user. */
    internal?: true;

    /** Passive name */
    name: string;

    /** Passive target number */
    target: number;

    /** Sensors used to target */
    sensors: string | string[];

    /** Actuators used to reach target */
    actuators: {
        /** Actuators used to reach target when we are under target */
        plus: string | string[],
        /** Actuators used to reach target when we are over target */
        minus?: string | string[]
    };

    /** Manual modes triggered by this passive regulation */
    manualModes?: string | string[];
}