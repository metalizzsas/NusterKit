export interface IWSObject {
  machine: Machine;
  cycle?: Cycle;
  slots: Slot[];
  io: Io[];
  handlers: Handler[];
  passives: Passive[];
  manuals: Manual[];
  profiles: Profile[];
  maintenances: Maintenance[];
}

export interface Maintenance {
  name: string;
  durationType: string;
  durationLimit: number;
  durationActual: number;
  durationProgress: number;
  operationDate?: number;
  procedure?: Procedure;
}

export interface Procedure {
  tools?: string[]
  steps: Step2[];
}

export interface Step2 {
  name: string;
  images: string[];
}

export interface Manual {
  state: boolean;
  name: string;
  controls: string[];
  incompatibility: string[];
}

export interface Passive {
  name: string;
  mode: string;
  enabled: boolean;
  sensor: string;
  actuator: string;
}

export interface Handler {
  name: string;
  type: string;
  ip: string;
  connected: boolean;
}

export interface Io {
  name: string;
  size: string;
  type: string;
  bus: string;
  automaton: number;
  address: number;
  default: number;
  value: number;
}

export interface Slot {
  name: string;
  type: string;
  isProductable: boolean;
  sensors: Sensor[];
  product?: ISlotProduct
}

export interface Sensor {
  io: string;
  type: string;
  value: number;
}

export interface ISlotProduct
{
  id: string;
  name: string;
  installDate: number;
  
}

export interface Cycle {
  status: Status;
  name: string;
  profileIdentifier: string;
  steps: Step[];
  watchdogConditions: WatchdogCondition[];
  currentStepIndex: number;
  profile?: Profile;
}

export interface Profile {
  identifier: string;
  name: string;
  fieldGroups: FieldGroup[];
  removable: boolean;
  overwriteable: boolean;
  isPremade?: boolean;
  modificationDate: number;
  id: string;
}

export interface FieldGroup {
  name: string;
  fields: Field[];
  id: string;
}

export interface Field {
  name: string;
  type: string;
  value: number;
  id: string;
  unity?: string;
  floatMin?: number;
  floatMax?: number;
  floatStep?: number;
}

export interface WatchdogCondition {
  gateName: string;
  gateValue: number;
  startOnly: boolean;
  result: boolean;
}

export interface Step {
  name: string;
  state: string;
  type: string;
  progress: number;
  isEnabled: IsEnabled;
  duration: IsEnabled;
  startingIO: StartingIO[];
  endingIO: StartingIO[];
  blocks: Block2[];

  runAmount?: IsEnabled;
  runCount?: number;
}

export interface Block2 {
  name: string;
  params: Param2[];
  blocks: (Block | Block)[];
  executed: boolean;
}

export interface Block {
  name: string;
  params: Param3[];
  blocks: any[];
  executed: boolean;
}

export interface Param3 {
  name: string;
  value: string;
  data: number | number | string;
}

export interface Param2 {
  name: string;
  value: string;
  data: number | number | number | string;
}

export interface StartingIO {
  name: string;
  params: Param[];
  blocks: any[];
  executed: boolean;
}

export interface Param {
  name: string;
  value: string;
  data: number | string;
}

export interface IsEnabled {
  name: string;
  value: string;
  data: number;
}

export interface Status {
  mode: string;
  progress: number;
  endReason?: string;
  endDate?: number;
}

export interface Machine {
  name: string;
  serial: string;
  model: string;
  variant: string;
  revision: number;
  _nuster: INuster
}

export interface INuster
{
  mainInformations: INusterMainInformations[]
}

export interface INusterMainInformations
{
  type: string;
  reference: string;
}