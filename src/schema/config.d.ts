/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Parameter Blocks that return a number from data()
 */
export type INumericParameterBlock =
  | IAdditionParameterBlock
  | IConditionalParameterBlock
  | IConstantParameterBlock
  | IIOReadParameterBlock
  | IMaintenanceParameterBlock
  | IMultiplyParameterBlock
  | IProfileParameterBlock
  | IReverseParameterBlock
  | ISlotLifetimeParameterBlock
  | IVariableParameterBlock;
/**
 * All the parameters blocks
 */
export type IParameterBlocks =
  | IAdditionParameterBlock
  | IConditionalParameterBlock
  | IConstantParameterBlock
  | IConstantStringParameterBlock
  | IIOReadParameterBlock
  | IMaintenanceParameterBlock
  | IMultiplyParameterBlock
  | IProfileParameterBlock
  | IReverseParameterBlock
  | ISlotLifetimeParameterBlock
  | IVariableParameterBlock
  | ISlotProductStatusParameterBlock;
export type IProgramBlocks =
  | IForLoopProgramBlock
  | IGroupProgramBlock
  | IIfProgramBlock
  | IIOProgramBlock
  | IMaintenanceProgramBlock
  | ISleepProgramBlock
  | ISlotLoadProgramBlock
  | ISlotUnloadProgramBlock
  | IStartTimerProgramBlock
  | IStopProgramBlock
  | IStopTimerProgramBlock
  | IVariableProgramBlock
  | IWhileLoopProgramBlock
  | IPassiveProgramBlock;
export type EIOGateBus = "in" | "out";
export type EIOGateSize = "bit" | "word";
export type EIOGateType = "a10v" | "analog_pressure" | "default" | "em4a10v" | "em4temp" | "pt100" | "um18";

/**
 * Machine JSON Specifications
 */
export interface Schema {
  /**
   * Cycle premades definition
   */
  cyclePremades: IPBRPremades[];
  /**
   * Cycle types definition
   */
  cycleTypes: IProgram[];
  /**
   * IOGates definition
   */
  iogates: IIOGate[];
  /**
   * IOHandler definitions
   */
  iohandlers: IIOHandler[];
  /**
   * Maintenance tasks definition
   */
  maintenance: IConfigMaintenance[];
  /**
   * Manuals modes definition
   */
  manual: IManualMode[];
  /**
   * Passive modes definition
   */
  passives: IPassive[];
  /**
   * Premade profile definition
   */
  profilePremades: IConfigProfile[];
  /**
   * Profile skeletons definition
   */
  profileSkeletons: IProfileSkeleton[];
  /**
   * Product slots definition
   */
  slots: IConfigSlot[];
  [k: string]: unknown;
}
export interface IPBRPremades {
  cycle: string;
  name: string;
  profile: string;
  [k: string]: unknown;
}
export interface IProgram {
  name: string;
  profileRequired: boolean;
  startConditions: IPBRStartCondition[];
  steps: IProgramStep[];
  [k: string]: unknown;
}
export interface IPBRStartCondition {
  checkChain: IPBRSCCheckChain;
  conditionName: string;
  startOnly: boolean;
  [k: string]: unknown;
}
export interface IPBRSCCheckChain {
  io?: {
    gateName: string;
    gateValue: number;
    [k: string]: unknown;
  };
  name: "io" | "parameter";
  /**
   * All the parameters blocks
   */
  parameter?:
    | IAdditionParameterBlock
    | IConditionalParameterBlock
    | IConstantParameterBlock
    | IConstantStringParameterBlock
    | IIOReadParameterBlock
    | IMaintenanceParameterBlock
    | IMultiplyParameterBlock
    | IProfileParameterBlock
    | IReverseParameterBlock
    | ISlotLifetimeParameterBlock
    | IVariableParameterBlock
    | ISlotProductStatusParameterBlock;
  [k: string]: unknown;
}
export interface IAdditionParameterBlock {
  /**
   * Parameter block name
   */
  name: "add";
  /**
   * Parameter block sub parameters blocks
   */
  params: (
    | IAdditionParameterBlock
    | IConditionalParameterBlock
    | IConstantParameterBlock
    | IIOReadParameterBlock
    | IMaintenanceParameterBlock
    | IMultiplyParameterBlock
    | IProfileParameterBlock
    | IReverseParameterBlock
    | ISlotLifetimeParameterBlock
    | IVariableParameterBlock
  )[];
  /**
   * Value from this parameter block
   */
  value?: string | number;
  [k: string]: unknown;
}
export interface IConditionalParameterBlock {
  /**
   * Parameter block name
   */
  name: "conditional";
  /**
   * Parameter block sub parameters blocks
   *
   * @minItems 4
   * @maxItems 4
   */
  params: [
    INumericParameterBlock,
    INumericParameterBlock,
    (
      | IAdditionParameterBlock
      | IConditionalParameterBlock
      | IConstantParameterBlock
      | IConstantStringParameterBlock
      | IIOReadParameterBlock
      | IMaintenanceParameterBlock
      | IMultiplyParameterBlock
      | IProfileParameterBlock
      | IReverseParameterBlock
      | ISlotLifetimeParameterBlock
      | IVariableParameterBlock
      | ISlotProductStatusParameterBlock
    ),
    (
      | IAdditionParameterBlock
      | IConditionalParameterBlock
      | IConstantParameterBlock
      | IConstantStringParameterBlock
      | IIOReadParameterBlock
      | IMaintenanceParameterBlock
      | IMultiplyParameterBlock
      | IProfileParameterBlock
      | IReverseParameterBlock
      | ISlotLifetimeParameterBlock
      | IVariableParameterBlock
      | ISlotProductStatusParameterBlock
    )
  ];
  /**
   * Value from this parameter block
   */
  value: "!=" | "<" | "==" | ">";
  [k: string]: unknown;
}
export interface IConstantParameterBlock {
  /**
   * Parameter block name
   */
  name: "const";
  /**
   * Parameter block sub parameters blocks
   */
  params?: IParameterBlocks[];
  /**
   * Value from this parameter block
   */
  value: number;
  [k: string]: unknown;
}
export interface IConstantStringParameterBlock {
  /**
   * Parameter block name
   */
  name: "conststr";
  /**
   * Parameter block sub parameters blocks
   */
  params?: IParameterBlocks[];
  /**
   * Value from this parameter block
   */
  value: string;
  [k: string]: unknown;
}
export interface IIOReadParameterBlock {
  /**
   * Parameter block name
   */
  name: "io";
  /**
   * Parameter block sub parameters blocks
   */
  params?: IParameterBlocks[];
  /**
   * Value from this parameter block
   */
  value: string;
  [k: string]: unknown;
}
export interface IMaintenanceParameterBlock {
  /**
   * Parameter block name
   */
  name: "maintenance";
  /**
   * Parameter block sub parameters blocks
   */
  params?: IParameterBlocks[];
  /**
   * Value from this parameter block
   */
  value: string;
  [k: string]: unknown;
}
export interface IMultiplyParameterBlock {
  /**
   * Parameter block name
   */
  name: "multiply";
  /**
   * Parameter block sub parameters blocks
   */
  params: INumericParameterBlock[];
  /**
   * Value from this parameter block
   */
  value?: string | number;
  [k: string]: unknown;
}
export interface IProfileParameterBlock {
  /**
   * Parameter block name
   */
  name: "profile";
  /**
   * Parameter block sub parameters blocks
   */
  params?: IParameterBlocks[];
  /**
   * Value from this parameter block
   */
  value: string;
  [k: string]: unknown;
}
export interface IReverseParameterBlock {
  /**
   * Parameter block name
   */
  name: "reverse";
  /**
   * Parameter block sub parameters blocks
   *
   * @minItems 1
   * @maxItems 1
   */
  params: [INumericParameterBlock];
  /**
   * Value from this parameter block
   */
  value?: string | number;
  [k: string]: unknown;
}
export interface ISlotLifetimeParameterBlock {
  /**
   * Parameter block name
   */
  name: "slotlife";
  /**
   * Parameter block sub parameters blocks
   */
  params?: IParameterBlocks[];
  /**
   * Value from this parameter block
   */
  value: string;
  [k: string]: unknown;
}
export interface IVariableParameterBlock {
  /**
   * Parameter block name
   */
  name: "variable";
  /**
   * Parameter block sub parameters blocks
   */
  params?: IParameterBlocks[];
  /**
   * Value from this parameter block
   */
  value: string;
  [k: string]: unknown;
}
export interface ISlotProductStatusParameterBlock {
  /**
   * Parameter block name
   */
  name: "slotstatus";
  /**
   * Parameter block sub parameters blocks
   */
  params?: IParameterBlocks[];
  /**
   * Value from this parameter block
   */
  value: string;
  [k: string]: unknown;
}
export interface IProgramStep {
  /**
   * Program blocks Array that is executed by this step
   */
  blocks: IProgramBlocks[];
  /**
   * Parameter Blocks that return a number from data()
   */
  duration:
    | IAdditionParameterBlock
    | IConditionalParameterBlock
    | IConstantParameterBlock
    | IIOReadParameterBlock
    | IMaintenanceParameterBlock
    | IMultiplyParameterBlock
    | IProfileParameterBlock
    | IReverseParameterBlock
    | ISlotLifetimeParameterBlock
    | IVariableParameterBlock;
  /**
   * Program Blocks array that are executed at the end of a step
   */
  endBlocks: IProgramBlocks[];
  /**
   * Parameter Blocks that return a number from data()
   */
  isEnabled:
    | IAdditionParameterBlock
    | IConditionalParameterBlock
    | IConstantParameterBlock
    | IIOReadParameterBlock
    | IMaintenanceParameterBlock
    | IMultiplyParameterBlock
    | IProfileParameterBlock
    | IReverseParameterBlock
    | ISlotLifetimeParameterBlock
    | IVariableParameterBlock;
  /**
   * Program Step name
   */
  name: string;
  /**
   * Parameter Blocks that return a number from data()
   */
  runAmount?:
    | IAdditionParameterBlock
    | IConditionalParameterBlock
    | IConstantParameterBlock
    | IIOReadParameterBlock
    | IMaintenanceParameterBlock
    | IMultiplyParameterBlock
    | IProfileParameterBlock
    | IReverseParameterBlock
    | ISlotLifetimeParameterBlock
    | IVariableParameterBlock;
  /**
   * Program Blocks array that are executed at the start of a step
   */
  startBlocks: IProgramBlocks[];
  [k: string]: unknown;
}
export interface IForLoopProgramBlock {
  blocks: IProgramBlocks[];
  currentIteration?: number;
  executed?: boolean;
  name: "for";
  /**
   * @minItems 1
   * @maxItems 1
   */
  params: [
    | IAdditionParameterBlock
    | IConditionalParameterBlock
    | IConstantParameterBlock
    | IIOReadParameterBlock
    | IMaintenanceParameterBlock
    | IMultiplyParameterBlock
    | IProfileParameterBlock
    | IReverseParameterBlock
    | ISlotLifetimeParameterBlock
    | IVariableParameterBlock
  ];
  [k: string]: unknown;
}
export interface IGroupProgramBlock {
  blocks: IProgramBlocks[];
  executed?: boolean;
  name: "group";
  params?: (
    | IAdditionParameterBlock
    | IConditionalParameterBlock
    | IConstantParameterBlock
    | IConstantStringParameterBlock
    | IIOReadParameterBlock
    | IMaintenanceParameterBlock
    | IMultiplyParameterBlock
    | IProfileParameterBlock
    | IReverseParameterBlock
    | ISlotLifetimeParameterBlock
    | IVariableParameterBlock
    | ISlotProductStatusParameterBlock
  )[];
  [k: string]: unknown;
}
export interface IIfProgramBlock {
  blocks?: IProgramBlocks[];
  executed?: boolean;
  falseBlocks: IProgramBlocks[];
  name: "if";
  /**
   * @minItems 3
   * @maxItems 3
   */
  params: [
    (
      | IAdditionParameterBlock
      | IConditionalParameterBlock
      | IConstantParameterBlock
      | IIOReadParameterBlock
      | IMaintenanceParameterBlock
      | IMultiplyParameterBlock
      | IProfileParameterBlock
      | IReverseParameterBlock
      | ISlotLifetimeParameterBlock
      | IVariableParameterBlock
    ),
    IConstantStringParameterBlock | ISlotProductStatusParameterBlock,
    (
      | IAdditionParameterBlock
      | IConditionalParameterBlock
      | IConstantParameterBlock
      | IIOReadParameterBlock
      | IMaintenanceParameterBlock
      | IMultiplyParameterBlock
      | IProfileParameterBlock
      | IReverseParameterBlock
      | ISlotLifetimeParameterBlock
      | IVariableParameterBlock
    )
  ];
  trueBlocks: IProgramBlocks[];
  [k: string]: unknown;
}
export interface IIOProgramBlock {
  blocks?: IProgramBlocks[];
  executed?: boolean;
  name: "io";
  /**
   * @minItems 2
   * @maxItems 2
   */
  params: [
    IConstantStringParameterBlock | ISlotProductStatusParameterBlock,
    (
      | IAdditionParameterBlock
      | IConditionalParameterBlock
      | IConstantParameterBlock
      | IIOReadParameterBlock
      | IMaintenanceParameterBlock
      | IMultiplyParameterBlock
      | IProfileParameterBlock
      | IReverseParameterBlock
      | ISlotLifetimeParameterBlock
      | IVariableParameterBlock
    )
  ];
  [k: string]: unknown;
}
export interface IMaintenanceProgramBlock {
  blocks?: IProgramBlocks[];
  executed?: boolean;
  name: "maintenance";
  /**
   * @minItems 2
   * @maxItems 2
   */
  params: [
    IConstantStringParameterBlock | ISlotProductStatusParameterBlock,
    (
      | IAdditionParameterBlock
      | IConditionalParameterBlock
      | IConstantParameterBlock
      | IIOReadParameterBlock
      | IMaintenanceParameterBlock
      | IMultiplyParameterBlock
      | IProfileParameterBlock
      | IReverseParameterBlock
      | ISlotLifetimeParameterBlock
      | IVariableParameterBlock
    )
  ];
  [k: string]: unknown;
}
export interface ISleepProgramBlock {
  blocks?: IProgramBlocks[];
  executed?: boolean;
  name: "sleep";
  /**
   * @minItems 1
   * @maxItems 1
   */
  params: [
    | IAdditionParameterBlock
    | IConditionalParameterBlock
    | IConstantParameterBlock
    | IIOReadParameterBlock
    | IMaintenanceParameterBlock
    | IMultiplyParameterBlock
    | IProfileParameterBlock
    | IReverseParameterBlock
    | ISlotLifetimeParameterBlock
    | IVariableParameterBlock
  ];
  [k: string]: unknown;
}
export interface ISlotLoadProgramBlock {
  blocks?: IProgramBlocks[];
  executed?: boolean;
  name: "slotLoad";
  /**
   * @minItems 1
   * @maxItems 1
   */
  params: [IConstantStringParameterBlock | ISlotProductStatusParameterBlock];
  [k: string]: unknown;
}
export interface ISlotUnloadProgramBlock {
  blocks?: IProgramBlocks[];
  executed?: boolean;
  name: "slotUnload";
  /**
   * @minItems 1
   * @maxItems 1
   */
  params: [IConstantStringParameterBlock | ISlotProductStatusParameterBlock];
  [k: string]: unknown;
}
export interface IStartTimerProgramBlock {
  blocks: IProgramBlocks[];
  executed?: boolean;
  name: "startTimer";
  /**
   * @minItems 2
   * @maxItems 2
   */
  params: [
    IConstantStringParameterBlock | ISlotProductStatusParameterBlock,
    (
      | IAdditionParameterBlock
      | IConditionalParameterBlock
      | IConstantParameterBlock
      | IIOReadParameterBlock
      | IMaintenanceParameterBlock
      | IMultiplyParameterBlock
      | IProfileParameterBlock
      | IReverseParameterBlock
      | ISlotLifetimeParameterBlock
      | IVariableParameterBlock
    )
  ];
  [k: string]: unknown;
}
export interface IStopProgramBlock {
  blocks?: IProgramBlocks[];
  executed?: boolean;
  name: "stop";
  /**
   * @minItems 1
   * @maxItems 1
   */
  params: [IConstantStringParameterBlock | ISlotProductStatusParameterBlock];
  [k: string]: unknown;
}
export interface IStopTimerProgramBlock {
  blocks?: IProgramBlocks[];
  executed?: boolean;
  name: "stopTimer";
  /**
   * @minItems 1
   * @maxItems 1
   */
  params: [IConstantStringParameterBlock | ISlotProductStatusParameterBlock];
  [k: string]: unknown;
}
export interface IVariableProgramBlock {
  blocks?: IProgramBlocks[];
  executed?: boolean;
  name: "variable";
  /**
   * @minItems 2
   * @maxItems 2
   */
  params: [
    IConstantStringParameterBlock | ISlotProductStatusParameterBlock,
    (
      | IAdditionParameterBlock
      | IConditionalParameterBlock
      | IConstantParameterBlock
      | IIOReadParameterBlock
      | IMaintenanceParameterBlock
      | IMultiplyParameterBlock
      | IProfileParameterBlock
      | IReverseParameterBlock
      | ISlotLifetimeParameterBlock
      | IVariableParameterBlock
    )
  ];
  [k: string]: unknown;
}
export interface IWhileLoopProgramBlock {
  blocks: IProgramBlocks[];
  executed?: boolean;
  name: "while";
  /**
   * @minItems 3
   * @maxItems 3
   */
  params: [
    (
      | IAdditionParameterBlock
      | IConditionalParameterBlock
      | IConstantParameterBlock
      | IIOReadParameterBlock
      | IMaintenanceParameterBlock
      | IMultiplyParameterBlock
      | IProfileParameterBlock
      | IReverseParameterBlock
      | ISlotLifetimeParameterBlock
      | IVariableParameterBlock
    ),
    IConstantStringParameterBlock | ISlotProductStatusParameterBlock,
    (
      | IAdditionParameterBlock
      | IConditionalParameterBlock
      | IConstantParameterBlock
      | IIOReadParameterBlock
      | IMaintenanceParameterBlock
      | IMultiplyParameterBlock
      | IProfileParameterBlock
      | IReverseParameterBlock
      | ISlotLifetimeParameterBlock
      | IVariableParameterBlock
    )
  ];
  [k: string]: unknown;
}
export interface IPassiveProgramBlock {
  blocks?: IProgramBlocks[];
  executed?: boolean;
  name: "passive";
  /**
   * @minItems 3
   * @maxItems 3
   */
  params: [
    IConstantStringParameterBlock | ISlotProductStatusParameterBlock,
    (
      | IAdditionParameterBlock
      | IConditionalParameterBlock
      | IConstantParameterBlock
      | IIOReadParameterBlock
      | IMaintenanceParameterBlock
      | IMultiplyParameterBlock
      | IProfileParameterBlock
      | IReverseParameterBlock
      | ISlotLifetimeParameterBlock
      | IVariableParameterBlock
    ),
    (
      | IAdditionParameterBlock
      | IConditionalParameterBlock
      | IConstantParameterBlock
      | IIOReadParameterBlock
      | IMaintenanceParameterBlock
      | IMultiplyParameterBlock
      | IProfileParameterBlock
      | IReverseParameterBlock
      | ISlotLifetimeParameterBlock
      | IVariableParameterBlock
    )
  ];
  [k: string]: unknown;
}
export interface IIOGate {
  address: number;
  automaton: number;
  bus: EIOGateBus;
  default: number;
  isCritical?: boolean;
  manualModeWatchdog?: boolean;
  name: string;
  size: EIOGateSize;
  type: EIOGateType;
  unity?: string;
  [k: string]: unknown;
}
export interface IIOHandler {
  /**
   * IP Address on the local network
   */
  ip: string;
  /**
   * Name of the IO Handler
   */
  name: string;
  /**
   * Type of the IO Handler
   */
  type: "em4" | "ex260s1" | "ex260s3" | "wago";
  [k: string]: unknown;
}
/**
 * Maintenance configuration base object
 */
export interface IConfigMaintenance {
  /**
   * Maintenance task duration
   */
  duration?: number;
  /**
   * Duration limit of this maintenance task
   */
  durationLimit: number;
  /**
   * Duration type of this maintenance task
   */
  durationType: string;
  /**
   * Maintenance task name
   */
  name: string;
  /**
   * Last operation date
   */
  operationDate?: number;
  procedure?: IMaintenanceProcedure;
  [k: string]: unknown;
}
/**
 * Maintenance procedure
 */
export interface IMaintenanceProcedure {
  /**
   * Array of procedure steps
   */
  steps: IMaintenanceProcedureStep[];
  /**
   * Procedure Tools used
   */
  tools: string[];
  [k: string]: unknown;
}
export interface IMaintenanceProcedureStep {
  /**
   * Procedure step media array
   */
  media: string[];
  /**
   * Procedure step name
   */
  name: string;
  [k: string]: unknown;
}
export interface IManualMode {
  /**
   * Manual mode analog scale
   */
  analogScale?: {
    max: number;
    min: number;
    [k: string]: unknown;
  };
  controls: (
    | {
        analogScaleDependant: boolean;
        name: string;
        [k: string]: unknown;
      }
    | string
  )[];
  /**
   * Incompatibilities between manual modes
   */
  incompatibility?: string[];
  /**
   * Name of the manual mode can contain 1 `#` for categorizing
   */
  name: string;
  /**
   * Manual modes required to be enabled
   */
  requires?: string[];
  /**
   * Watchdog Security chain
   */
  watchdog?: IManualWatchdogCondition[];
  [k: string]: unknown;
}
export interface IManualWatchdogCondition {
  /**
   * Gate name to control
   */
  gateName: string;
  /**
   * Gate value required for the security
   */
  gateValue: number;
  [k: string]: unknown;
}
export interface IPassive {
  /**
   * Actuators used to reach target
   */
  actuators: {
    /**
     * Actuators used to reach target when we are over target
     */
    minus?: string[] | string;
    /**
     * Actuators used to reach target when we are under target
     */
    plus: string[] | string;
    [k: string]: unknown;
  };
  /**
   * If a passive mode is internal, it means that it is hidden from user.
   */
  internal?: boolean;
  /**
   * Manual modes triggered by this passive regulation
   */
  manualModes?: string[] | string;
  /**
   * Passive name
   */
  name: string;
  /**
   * Sensors used to target
   */
  sensors: string[] | string;
  /**
   * Passive target number
   */
  target: number;
  [k: string]: unknown;
}
/**
 * Profiles stored in the configuration `specs.json` file
 */
export interface IConfigProfile {
  /**
   * Is this profile premade
   */
  isPremade: boolean;
  /**
   * Last profile modification data
   */
  modificationDate?: number;
  /**
   * Profile name
   */
  name: string;
  /**
   * Is this profile overwritable
   */
  overwriteable: boolean;
  /**
   * Is this profile removable
   */
  removable: boolean;
  /**
   * Profile Skeleton reference
   */
  skeleton: string;
  values: {
    [k: string]: number | boolean;
  };
  [k: string]: unknown;
}
export interface IProfileSkeleton {
  /**
   * Fiels groups of this profile skeleton
   */
  fieldGroups: IProfileSkeletonFieldGroup[];
  /**
   * Profile identifier, used to map between profiles and cycles
   */
  identifier: string;
  [k: string]: unknown;
}
export interface IProfileSkeletonFieldGroup {
  /**
   * Profile fields
   */
  fields: (
    | (IProfileSkeletonFieldFloat & IProfileSkeletonField)
    | (IProfileSkeletonFieldBoolean & IProfileSkeletonField)
    | (IProfileSkeletonFieldNumber & IProfileSkeletonField)
    | (IProfileSkeletonFieldTime & IProfileSkeletonField)
  )[];
  /**
   * Name of the profile field group
   */
  name: string;
  [k: string]: unknown;
}
/**
 * Float ProfileField type
 */
export interface IProfileSkeletonFieldFloat {
  floatMax: number;
  floatMin: number;
  floatStep: number;
  /**
   * Name of the profile field
   */
  name: string;
  /**
   * Type of the profile field
   */
  type: "float";
  /**
   * Unity of the profile field, it used for UI purposes only
   */
  unity?: string;
  /**
   * Value contained byt the profile field
   */
  value: number;
  [k: string]: unknown;
}
export interface IProfileSkeletonField {
  /**
   * Name of the profile field
   */
  name: string;
  /**
   * Type of the profile field
   */
  type: "bool" | "float" | "int" | "time";
  /**
   * Unity of the profile field, it used for UI purposes only
   */
  unity?: string;
  /**
   * Value contained byt the profile field
   */
  value: number | boolean;
  [k: string]: unknown;
}
/**
 * Boolean profile field type
 */
export interface IProfileSkeletonFieldBoolean {
  /**
   * Name of the profile field
   */
  name: string;
  /**
   * Type of the profile field
   */
  type: "bool";
  /**
   * Unity of the profile field, it used for UI purposes only
   */
  unity?: string;
  /**
   * Value contained byt the profile field
   */
  value: boolean;
  [k: string]: unknown;
}
/**
 * Number profile field type
 */
export interface IProfileSkeletonFieldNumber {
  /**
   * Name of the profile field
   */
  name: string;
  /**
   * Type of the profile field
   */
  type: "int";
  /**
   * Unity of the profile field, it used for UI purposes only
   */
  unity?: string;
  /**
   * Value contained byt the profile field
   */
  value: number;
  [k: string]: unknown;
}
/**
 * Time profile field type
 */
export interface IProfileSkeletonFieldTime {
  /**
   * Name of the profile field
   */
  name: string;
  /**
   * Type of the profile field
   */
  type: "time";
  units: ("hours" | "milliseconds" | "minutes" | "seconds")[];
  /**
   * Unity of the profile field, it used for UI purposes only
   */
  unity?: string;
  /**
   * Value contained byt the profile field
   */
  value: number;
  [k: string]: unknown;
}
/**
 * Slot definition used in config
 */
export interface IConfigSlot {
  /**
   * Call to action, For UI Purposes only
   */
  callToAction?: ICallToAction[];
  /**
   * Slots name
   */
  name: string;
  productOptions?: ISlotProductOptions;
  /**
   * Sensors available for this Slots
   */
  sensors: ISlotSensor[];
  /**
   * Slot type
   */
  type: string;
  [k: string]: unknown;
}
/**
 * Call to action inteface
 */
export interface ICallToAction {
  /**
   * API Endpoint to be reached by the CTA (NusterTurbine Endpoints)
   */
  APIEndpoint?: {
    /**
     * HTTP Request Method
     */
    method: "delete" | "get" | "post" | "put";
    /**
     * URL Reached
     */
    url: string;
    [k: string]: unknown;
  };
  /**
   * UIEndpoint reached by the CTA (NusterDesktop Endpoints)
   */
  UIEndpoint?: string;
  /**
   * Name of this CTA
   */
  name: string;
  [k: string]: unknown;
}
/**
 * Production options, If this is set the slot become productable
 */
export interface ISlotProductOptions {
  /**
   * Default product series
   */
  defaultProductSeries: "bc" | "cr" | "llc" | "tc" | "usl" | "wr";
  /**
   * Lifespan of the product in days if -1, no lifespan, count the life since the product hass been installed
   */
  lifespan: number;
  [k: string]: unknown;
}
/**
 * Slot Sensor interface
 */
export interface ISlotSensor {
  /**
   * IO gate name of this sensor
   */
  io: string;
  /**
   * Slot type
   */
  type: "level-a" | "level-max-n" | "level-min-n" | "level-np" | "temperature";
  /**
   * Slot value
   */
  value?: number;
  [k: string]: unknown;
}
