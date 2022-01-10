export interface IWSContent {
  machine: Machine;
  cycle?: Cycle;
  slots: Slot[];
  io: Io[];
  passives: Passive[];
  profiles: Profile2[];
  maintenances: Maintenance[];
}

interface Maintenance {
  name: string;
  durationType: string;
  durationLimit: number;
  durationActual: number;
  durationProgress: number;
  operationDate?: number;
  procedure: Procedure;
}

interface Procedure {
  desc: string;
  steps: Step2[];
}

interface Step2 {
  name: string;
  images: string[];
}

interface Profile2 {
  name: string;
  modificationDate: number;
  fieldGroups: FieldGroup[];
  id: string;
  identifier?: string;
}

interface Passive {
  name: string;
  sensor: string;
  actuator: string;
}

interface Io {
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
}

interface Sensor {
  io: string;
  type: string;
}

interface Cycle {
  status: Status;
  name: string;
  profileIdentifier: string;
  steps: Step[];
  watchdogConditions: WatchdogCondition[];
  currentStepIndex: number;
  profile: Profile;
}

interface Profile {
  identifier: string;
  name: string;
  fieldGroups: FieldGroup[];
  modificationDate: number;
  id: string;
}

interface FieldGroup {
  name: string;
  fields: Field[];
  id: string;
}

interface Field {
  name: string;
  type: string;
  value: number;
  id: string;
  unity?: string;
  floatMin?: number;
  floatMax?: number;
  floatStep?: number;
}

interface WatchdogCondition {
  result: boolean;
  gateName: string;
  gateValue: number;
  startOnly: boolean;
}

interface Step {
  name: string;
  state: string;
  type: string;
  isEnabled: IsEnabled;
  duration: IsEnabled;
  blocks: Block2[];
}

interface Block2 {
  name: string;
  params: Param[];
  blocks: Block[][];
}

interface Block {
  name: string;
  params: Param2[];
  blocks: any[];
}

interface Param2 {
  name: string;
  value: string;
  data: (number | string)[];
}

interface Param {
  name: string;
  value: string;
  data: number | number | string;
}

interface IsEnabled {
  name: string;
  value: string;
  data: number;
}

interface Status {
  mode: string;
}

interface Machine {
  name: string;
  serial: string;
  model: string;
  variant: string;
  revision: number;
}