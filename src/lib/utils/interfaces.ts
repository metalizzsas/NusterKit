export interface IWSObject {
  machine: Machine;
  cycle: Cycle;
  slots: Slot[];
  io: Io[];
  handlers: Handler[];
  passives: any[];
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
  procedure?: Procedure;
}

interface Procedure {
  tools: any[];
  steps: Step2[];
}

interface Step2 {
  name: string;
  media: string[];
}

export interface Profile {
  identifier: string;
  fieldGroups: FieldGroup[];
  id: string;
  name: string;
  modificationDate: number;
  removable: boolean;
  overwriteable: boolean;
  isPremade: boolean;
}

interface FieldGroup {
  name: string;
  fields: Field[];
}

interface Field {
  name: string;
  type: string;
  value: number;
  unity?: string;
  floatMin?: number;
  floatMax?: number;
  floatStep?: number;
}

export interface Manual {
  name: string;
  category: string;
  
  incompatibility?: string[];
  requires?: string[];
  
  state: number;
  controls: (string | Control)[];
  analogScale?: AnalogScale;
}

interface AnalogScale {
  min: number;
  max: number;
}

interface Control {
  name: string;
  analogScaleDependant?: boolean;
}

interface Handler {
  name: string;
  type: string;
  ip: string;
  connected: boolean;
}

interface Io {
  name: string;
  category: string;
  size: string;
  type: string;
  bus: string;
  automaton: number;
  address: number;
  default: number;
  value: number;
  isCritical?: boolean;
}

export interface Slot {
  name: string;
  type: string;
  sensors: Sensor[];
  callToAction: CallToAction[];
  productOptions?: ProductOptions;
  isProductable: boolean;
  productData?: ProductData;
}

interface ProductData {
  productSeries: string;
  loadDate: string;
  lifetimeProgress: number;
  lifetimeRemaining: number;
}

interface ProductOptions {
  defaultProductSeries: string;
  lifespan: number;
}

interface CallToAction {
  name: string;
  APIEndpoint: APIEndpoint;
  UIEndpoint?: string;
}

interface APIEndpoint {
  url: string;
  method: string;
}

interface Sensor {
  io: string;
  type: string;
  value: number;
}

export interface Cycle {
  status: Status;
  name: string;
  steps: Step[];
  startConditions: StartCondition[];
  currentStepIndex: number;
  profile?: ProfileRaw;
}

interface ProfileRaw {
  skeleton: string;
  name: string;
  modificationDate: number;
  removable: boolean;
  overwriteable: boolean;
  isPremade: boolean;
  values: Record<string, number>;
}

interface StartCondition {
  conditionName: string;
  startOnly: boolean;
  result: string;
}

interface Step {
  name: string;
  state: string;
  type: string;
  isEnabled: Param;
  duration: Param;
  progress: number;
  startTime?: number;
  startBlocks: Block[];
  endBlocks: Block[];
  blocks: Block[];
  runCount?: number;
  runAmount?: Param;
}

interface Block {
  name: string;
  params: Param[];
  blocks: Block[];
  executed: boolean;
}

interface Param {
  name: string;
  value: string;
  data: number | string;
}

interface Status {
  mode: string;
  startDate: number;
  progress: number;
  endReason: string;
  endDate: number;
}

interface Machine {
  name: string;
  serial: string;
  model: string;
  variant: string;
  revision: number;
  nusterVersion: string;
  balenaVersion: string;
  settings: Settings;
  hypervisorData?: IHypervisorData;
}

interface Settings {
  maskedPremades: any[];
  maskedProfiles: any[];
  maskedManuals: any[];
  ioControlsMasked: boolean;
}

export interface IHypervisorData {
  status: string;
  appState: string;
  overallDownloadProgress?: number;
  containers: Container[];
  images: Image[];
  release: string;
}

interface Image {
  name: string;
  appId: number;
  serviceName: string;
  imageId: number;
  dockerImageId: string;
  status: string;
  downloadProgress?: number;
}

interface Container {
  status: string;
  serviceName: string;
  appId: number;
  imageId: number;
  serviceId: number;
  containerId: string;
  createdAt: string;
}