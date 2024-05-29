import type { Comparators, NumericParameterBlocks, StringParameterBlocks } from "../parameter";

// Flow control blocks

/** **For Loop** Runs blocks util *limit* is reached. */
export type ForProgramBlock = {"for": {
    "limit": NumericParameterBlocks,
    "blocks": Array<AllProgramBlocks>
}};

/** **If Statement** Runs *true_blocks* if *[0]* compared to *[2]* by *[1]* is true otherwise runs *false_blocks*. */
export type IfProgramBlock = {"if": {
    "comparison":  [NumericParameterBlocks, Comparators, NumericParameterBlocks]
    "true_blocks": Array<AllProgramBlocks>,
    "false_blocks"?: Array<AllProgramBlocks>
}};

/** **While Loop** Runs *blocks* until *[0]* compared to *[2]* by *[1]* is false. */
export type WhileProgramBlock = {"while": {
    "comparison": [NumericParameterBlocks, Comparators, NumericParameterBlocks]
    "blocks": Array<AllProgramBlocks>
}};

/** **Sleep** Will wait the amount of time supplied. */
export type SleepProgramBlock = {"sleep": NumericParameterBlocks};
/** **Stop** Will stop the cycle with the reason supplied. */
export type StopProgramBlock = {"stop": StringParameterBlocks};
/** **Variable** Will set the *[0] Variable name* to *[1] Variable value*. */
export type SetVariableProgramBlock = {"set_var": [StringParameterBlocks, NumericParameterBlocks]};

// Timers control

export type StartTimerProgramBlock = {"start_timer": {
    "timer_name": StringParameterBlocks,
    "timer_interval": NumericParameterBlocks,
    "blocks": Array<AllProgramBlocks>
}};

export type StopTimerProgramBlock = {"stop_timer": StringParameterBlocks}

// Container control

export type ContainerProductLoadProgramBlock = {"load_container": [StringParameterBlocks, StringParameterBlocks]};
export type ContainerProductUnloadProgramBlock = {"unload_container": StringParameterBlocks};

// Other program blocks

export type IOWriteProgramBlock = {"io_write": [StringParameterBlocks, NumericParameterBlocks]};
export type AppendMaintenanceProgramBlock = {"append_maintenance": [StringParameterBlocks, NumericParameterBlocks]}

/** All Program blocks */
export type AllProgramBlocks = 
ForProgramBlock | 
IfProgramBlock | 
WhileProgramBlock | 
SleepProgramBlock | 
StopProgramBlock | 
SetVariableProgramBlock | 
StartTimerProgramBlock | 
StopTimerProgramBlock |
ContainerProductLoadProgramBlock | 
ContainerProductUnloadProgramBlock |
IOWriteProgramBlock | 
AppendMaintenanceProgramBlock;