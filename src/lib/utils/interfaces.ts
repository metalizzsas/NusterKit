export interface IWSObject {
  machine: Machine;
  slots: Slot[];
  io: Io[];
  handlers: Handler[];
  passives: Passive[];
  manuals: Manual[];
  profiles: Profile[];
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
  steps: Step[];
}

interface Step {
  name: string;
  images: string[];
}

export interface Profile {
  name: string;
  modificationDate: number;
  fieldGroups: FieldGroup[];
  id: string;
  identifier?: string;
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

export interface Manual {
  state: boolean;
  name: string;
  controls: string[];
  incompatibility: string[];
}

interface Passive {
  name: string;
  mode: string;
  enabled: boolean;
  sensor: string;
  actuator: string;
}

interface Handler {
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
}

interface Sensor {
  io: string;
  type: string;
}

interface Machine {
  name: string;
  serial: string;
  model: string;
  variant: string;
  revision: number;
}