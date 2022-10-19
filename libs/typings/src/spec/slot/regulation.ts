export interface IRegulation
{
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