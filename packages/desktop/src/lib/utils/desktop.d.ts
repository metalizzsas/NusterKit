declare module "balena/IDeviceData" {
    /**
     * Device data given by balenaOS Hypervisor at /v1/device api endpoint
     */
    export interface IDeviceData {
        api_port: number;
        ip_address: string;
        commit: string;
        status: string;
        download_progress: number;
        os_version: string;
        supervisor_version: string;
        update_pending: boolean;
        update_downloaded: boolean;
        update_failed: boolean;
    }
}
declare module "balena/IHypervisorDevice" {
    /** BalenaOS Hypervisor Container data from /v2/state/status api endpoint */
    export interface IHypervisorData {
        status: string;
        appState: string;
        overallDownloadProgress?: number;
        containers: {
            status: string;
            serviceName: string;
            appId: number;
            imageId: number;
            serviceId: number;
            containerId: string;
            createdAt: string;
        }[];
        images: {
            name: string;
            appId: number;
            serviceName: string;
            imageId: number;
            dockerImageId: string;
            status: string;
            downloadProgress?: number;
        }[];
        release: string;
    }
}
declare module "balena/IVPNData" {
    /**
     * BalenaOS Hypervisor given VPN Data from /v2/device/vpn endpoint data
     */
    export interface IVPNData {
        status: string;
        vpn: {
            enabled: boolean;
            connected: boolean;
        };
    }
}
declare module "gates/IMappedGate" {
    import { IIOGateConfig } from "gates/IIOGate";
    /** Mapped gates, converts automatically data from controller to Human readable data */
    export interface IMappedGate extends IIOGateConfig {
        type: "mapped";
        /** Size is always a word for this typoe of Gate */
        size: "word";
        /** Mapped output min data, to Human */
        mapOutMin: number;
        /** Mapped output max data, to Human */
        mapOutMax: number;
        /**
         * Mapped input min data, from IO Controller
         * @defaultValue 0
         */
        mapInMin?: number;
        /**
         * Mapped input max data, from IOController
         * @defaultValue 32767
         */
        mapInMax?: number;
    }
}
declare module "gates/IUM18Gate" {
    import { IIOGateConfig } from "gates/IIOGate";
    export interface IUM18Gate extends IIOGateConfig {
        type: "um18";
        levelMax: number;
    }
}
declare module "gates/IPT100Gate" {
    import { IIOGateConfig } from "gates/IIOGate";
    export interface IPT100Gate extends IIOGateConfig {
        type: "pt100";
        size: "word";
        unity: "°C";
        bus: "in";
    }
}
declare module "gates/IDefaultGate" {
    import { IIOGateConfig } from "gates/IIOGate";
    export interface IDefaultGate extends IIOGateConfig {
        type: "default";
    }
}
declare module "gates/IIOGate" {
    import { IMappedGate } from "gates/IMappedGate";
    import { IUM18Gate } from "gates/IUM18Gate";
    import { IPT100Gate } from "gates/IPT100Gate";
    import { IDefaultGate } from "gates/IDefaultGate";
    export type IOGateTypeName = "pt100" | "um18" | "mapped" | "default";
    export interface IIOGateConfig {
        /** Gate name */
        name: string;
        /** Gate controller data size */
        size: "bit" | "word";
        /** Gate bus */
        bus: "in" | "out";
        /** Gate type */
        type: IOGateTypeName;
        /** Automaton where this gate is available */
        controllerId: number;
        /** Address on the automaton address range */
        address: number;
        /** Default value of this gate */
        default: number;
        /** Unity used by this gate */
        unity?: string;
    }
    export type IOGatesConfig = (IDefaultGate | IUM18Gate | IMappedGate | IPT100Gate) & IIOGateConfig;
    export interface IIOGate extends IIOGateConfig {
        category: string;
        value: number;
        /** Reads the value of the gate */
        read(): Promise<boolean>;
        /**
         * Writes data to the gate
         * @param data Data to write to the gate
         */
        write(data: number): Promise<boolean>;
    }
    export type IOGates = (IDefaultGate | IUM18Gate | IMappedGate | IPT100Gate) & IIOGate;
}
declare module "IAddon" {
    export interface IAddon {
        /** Addon name, should be the same as the Json file holding him */
        addonName: string;
        /** Addon content Array  */
        content: {
            /**
             * Path were the content is added
             * @warning As Template literals are **not supported** by json schema be careful about the path
             */
            path: string;
            /**
             * Insertion mode
             * @defaultValue `merge`
             */
            mode: "replace" | "merge";
            /**
             * Content replaced or inserted to this category
             * @warning Content is not type aware about what you are adding here, **⚠ be careful**
             */
            content: unknown;
        }[];
    }
}
declare module "IConfiguration" {
    import { IAddon } from "IAddon";
    /** Configuration info.json driving NusterTurbine */
    export interface IConfiguration {
        /** Machine Name */
        name: string;
        /** Machine Serial number */
        serial: string;
        /** Machine model */
        model: string;
        /** Machine variant */
        variant: string;
        /** Machine revision */
        revision: number;
        /** Machine Addons */
        addons?: string[];
        /** Machine Specific addon, should be used as less as possible */
        machineAddons?: IAddon[];
        /** Machine Settings */
        settings?: IMachineSettings;
    }
    /** Machine additional settings */
    export interface IMachineSettings {
        /** Masked premade cycles */
        maskedPremades?: string[];
        /** Masked premade profiles */
        maskedProfiles?: string[];
        /** Masked manual modes */
        maskedManuals?: string[];
        /**
         * Do profile button is masked
         * @defaultValue false //TODO check this
         */
        profilesMasked?: boolean;
        /**
         * Disable IO controls access
         * @defaultValue true
         */
        ioControlsMasked?: false;
        /**
         * Enable prototype mode
         * @defaultValue false
         */
        isPrototype?: true;
    }
}
declare module "IIOControllers" {
    export interface IIOPhysicalControllerConfig {
        /** Type of the IO Handler */
        type: IOControllersTypes;
        /** IP Address on the local network */
        ip: string;
    }
    /** IOPhysicalController Boilerplate */
    export interface IIOPhysicalController extends IIOPhysicalControllerConfig {
        /** Is the controller connected */
        connected: boolean;
        /** Is the controller unreachable */
        unreachable: boolean;
        /** Function to connect to the controller */
        connect(): Promise<boolean>;
        /**
         * Writes data on the controller
         * @param address Address to write data to
         * @param data Data to write
         * @param word is the data a word or a bit
         */
        writeData(address: number, data: number, word?: boolean): Promise<void>;
        /**
         * Reads data from the controller
         * @param address Address to read data from
         * @param word is the data to read a word or a bit
         */
        readData(address: number, word?: boolean): Promise<number>;
    }
    export interface IWagoController extends IIOPhysicalControllerConfig {
        type: "wago";
    }
    export interface IEX260Controller extends IIOPhysicalControllerConfig {
        type: "ex260sx";
        /** Corresponding size of the EX260 (either 16 outputs or 32 outputs) */
        size: 16 | 32;
    }
    export type IOControllersConfig = (IWagoController | IEX260Controller) & IIOPhysicalControllerConfig;
    export type IOControllersTypes = IWagoController["type"] | IEX260Controller["type"];
}
declare module "IMaintenance" {
    /** Maintenance configuration base object */
    export interface IConfigMaintenance extends IMaintenance {
        /** Duration type of this maintenance task */
        durationType: string;
        /** Duration limit of this maintenance task */
        durationLimit: number;
        /** Maintenance procedure */
        procedure?: IMaintenanceProcedure;
    }
    export type ISocketMaintenance = IConfigMaintenance & IMaintenance & {
        durationActual: number;
        durationProgress: number;
    };
    /** Maintenance task object stored in database */
    export interface IMaintenance {
        /** Maintenance task name */
        name: string;
        /** Maintenance task duration */
        duration?: number;
        /** Last operation date */
        operationDate?: number;
    }
    export interface IMaintenanceProcedure {
        /** Procedure Tools used */
        tools: string[];
        /** Array of procedure steps */
        steps: IMaintenanceProcedureStep[];
    }
    export interface IMaintenanceProcedureStep {
        /** Procedure step name */
        name: string;
        /** Procedure step media array */
        media: string[];
    }
}
declare module "IManualMode" {
    export interface IManualMode {
        /** Name of the manual mode can contain 1 `#` for categorizing */
        name: string;
        controls: ({
            name: string;
            analogScaleDependant: boolean;
        } | string)[];
        /** Incompatibilities between manual modes */
        incompatibility?: string[];
        /** Manual modes required to be enabled */
        requires?: string[];
        /** Watchdog Security chain */
        watchdog?: IManualWatchdogCondition[];
        /** Manual mode analog scale */
        analogScale?: {
            min: number;
            max: number;
        };
    }
    export type ISocketManual = Omit<IManualMode, "controls" | "watchdog"> & {
        category: string;
        locked: boolean;
        state: number;
    };
    export interface IManualWatchdogCondition {
        /** Gate name to control */
        gateName: string;
        /** Gate value required for the security */
        gateValue: number;
    }
}
declare module "IPassive" {
    export interface IPassive {
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
            plus: string | string[];
            /** Actuators used to reach target when we are over target */
            minus?: string | string[];
        };
        /** Manual modes triggered by this passive regulation */
        manualModes?: string | string[];
    }
    export interface IPassiveStoredLogData {
        time?: Date;
        state?: boolean;
        targetValue: number;
        interpolatedSensorsValue: number;
    }
    export type ISocketPassive = Omit<IPassive, "actuators" | "manualModes" | "sensors"> & {
        current: number;
        state: boolean;
        logData: IPassiveStoredLogData[];
    };
}
declare module "IProfile" {
    import { ObjectId } from "mongoose";
    /** Profiles stored in the configuration `specs.json` file */
    export interface IConfigProfile extends Omit<IProfile, "values"> {
        values: {
            [x: string]: number | boolean;
        };
    }
    /** Object used internaly by ProfileController */
    export interface IProfile {
        /** Profile name */
        name: string;
        /** Profile Skeleton reference */
        skeleton: string;
        /** Last profile modification data */
        modificationDate?: number;
        /** Is this profile premade */
        isPremade: boolean;
        /** Is this profile removable */
        removable: boolean;
        /** Is this profile overwritable */
        overwriteable: boolean;
        /** Map of the profile values */
        values: Map<string, number>;
    }
    export interface IProfileSkeleton {
        /** Profile identifier, used to map between profiles and cycles */
        identifier: string;
        /** Fiels groups of this profile skeleton */
        fieldGroups: IProfileSkeletonFieldGroup[];
    }
    interface IProfileSkeletonFieldGroup {
        /** Name of the profile field group */
        name: string;
        /** Profile fields */
        fields: ProfileSkeletonFields[];
    }
    /** Base profile types */
    export type ProfileSkeletonFields = (IProfileSkeletonFieldFloat | IProfileSkeletonFieldBoolean | IProfileSkeletonFieldNumber | IProfileSkeletonFieldTime) & IProfileSkeletonField;
    interface IProfileSkeletonField {
        /** Name of the profile field */
        name: string;
        /** Type of the profile field */
        type: "bool" | "float" | "int" | "time";
        /** Value contained byt the profile field */
        value: number | boolean;
        /** Unity of the profile field, it used for UI purposes only */
        unity?: string;
    }
    /** Float ProfileField type */
    interface IProfileSkeletonFieldFloat extends IProfileSkeletonField {
        type: "float";
        value: number;
        floatMin: number;
        floatMax: number;
        floatStep: number;
    }
    /** Boolean profile field type */
    interface IProfileSkeletonFieldBoolean extends IProfileSkeletonField {
        type: "bool";
        value: boolean;
    }
    /** Number profile field type */
    interface IProfileSkeletonFieldNumber extends IProfileSkeletonField {
        type: "int";
        value: number;
    }
    /** Time profile field type */
    interface IProfileSkeletonFieldTime extends IProfileSkeletonField {
        type: "time";
        units: ("hours" | "minutes" | "seconds" | "milliseconds")[];
        value: number;
    }
    /** Stored format of the profile in the database */
    export interface IProfileExportable extends IProfileSkeleton {
        /** Id of the profile */
        id?: ObjectId;
        /** Is this profile premade */
        isPremade: boolean;
        /** Name of the profile */
        name: string;
        /** Last modification date of the profile */
        modificationDate: number;
        /** Is this profile removable */
        removable: boolean;
        /** Is this profile Overwritable */
        overwriteable: boolean;
    }
}
declare module "programblocks/ParameterBlocks/IAdditionParameterBlock" {
    import { INumericParameterBlock, IParameterBlock } from "IParameterBlock";
    export interface IAdditionParameterBlock extends IParameterBlock {
        name: "add";
        params: INumericParameterBlock[];
    }
}
declare module "programblocks/ParameterBlocks/IConditionalParameterBlock" {
    import { INumericParameterBlock, IParameterBlock, IStringParameterBlock } from "IParameterBlock";
    export interface IConditionalParameterBlock extends IParameterBlock {
        name: "conditional";
        value: ">" | "<" | "==" | "!=";
        params: [
            INumericParameterBlock,
            INumericParameterBlock,
            INumericParameterBlock | IStringParameterBlock,
            INumericParameterBlock | IStringParameterBlock
        ];
    }
}
declare module "programblocks/ParameterBlocks/IConstantParameterBlock" {
    import { IParameterBlock } from "IParameterBlock";
    export interface IConstantParameterBlock extends IParameterBlock {
        name: "const";
        value: number;
    }
}
declare module "programblocks/ParameterBlocks/IConstantStringParameterBlock" {
    import { IParameterBlock } from "IParameterBlock";
    export interface IConstantStringParameterBlock extends IParameterBlock {
        name: "conststr";
        value: string;
    }
}
declare module "programblocks/ParameterBlocks/IIOReadParameterBlock" {
    import { IParameterBlock } from "IParameterBlock";
    export interface IIOReadParameterBlock extends IParameterBlock {
        name: "io";
        value: string;
    }
}
declare module "programblocks/ParameterBlocks/IMaintenanceParameterBlock" {
    import { IParameterBlock } from "IParameterBlock";
    export interface IMaintenanceParameterBlock extends IParameterBlock {
        name: "maintenance";
        value: string;
    }
}
declare module "programblocks/ParameterBlocks/IMultiplyParameterBlock" {
    import { INumericParameterBlock, IParameterBlock } from "IParameterBlock";
    export interface IMultiplyParameterBlock extends IParameterBlock {
        name: "multiply";
        params: INumericParameterBlock[];
    }
}
declare module "programblocks/ParameterBlocks/IProfileParameterBlock" {
    import { IParameterBlock } from "IParameterBlock";
    export interface IProfileParameterBlock extends IParameterBlock {
        name: "profile";
        value: string;
    }
}
declare module "programblocks/ParameterBlocks/IReverseParameterBlock" {
    import { INumericParameterBlock, IParameterBlock } from "IParameterBlock";
    export interface IReverseParameterBlock extends IParameterBlock {
        name: "reverse";
        params: [INumericParameterBlock];
    }
}
declare module "programblocks/ParameterBlocks/ISlotLifetimeParameterBlock" {
    import { IParameterBlock } from "IParameterBlock";
    export interface ISlotLifetimeParameterBlock extends IParameterBlock {
        name: "slotlife";
        value: string;
    }
}
declare module "programblocks/ParameterBlocks/ISlotProductStatusParameterBlock" {
    import { IParameterBlock } from "IParameterBlock";
    export interface ISlotProductStatusParameterBlock extends IParameterBlock {
        name: "slotstatus";
        value: string;
    }
}
declare module "programblocks/ParameterBlocks/IVariableParameterBlock" {
    import { IParameterBlock } from "IParameterBlock";
    export interface IVariableParameterBlock extends IParameterBlock {
        name: "variable";
        value: string;
    }
}
declare module "IParameterBlock" {
    import { IAdditionParameterBlock } from "programblocks/ParameterBlocks/IAdditionParameterBlock";
    import { IConditionalParameterBlock } from "programblocks/ParameterBlocks/IConditionalParameterBlock";
    import { IConstantParameterBlock } from "programblocks/ParameterBlocks/IConstantParameterBlock";
    import { IConstantStringParameterBlock } from "programblocks/ParameterBlocks/IConstantStringParameterBlock";
    import { IIOReadParameterBlock } from "programblocks/ParameterBlocks/IIOReadParameterBlock";
    import { IMaintenanceParameterBlock } from "programblocks/ParameterBlocks/IMaintenanceParameterBlock";
    import { IMultiplyParameterBlock } from "programblocks/ParameterBlocks/IMultiplyParameterBlock";
    import { IProfileParameterBlock } from "programblocks/ParameterBlocks/IProfileParameterBlock";
    import { IReverseParameterBlock } from "programblocks/ParameterBlocks/IReverseParameterBlock";
    import { ISlotLifetimeParameterBlock } from "programblocks/ParameterBlocks/ISlotLifetimeParameterBlock";
    import { ISlotProductStatusParameterBlock } from "programblocks/ParameterBlocks/ISlotProductStatusParameterBlock";
    import { IVariableParameterBlock } from "programblocks/ParameterBlocks/IVariableParameterBlock";
    /** Base parameter blocks names */
    export type ParameterBlockNames = "default" | "const" | "conststr" | "profile" | "io" | "add" | "multiply" | "reverse" | "conditional" | "variable" | "slotlife" | "slotstatus" | "maintenance";
    /** Base parameter block */
    export interface IParameterBlock {
        /** Parameter block name */
        name: ParameterBlockNames;
        /** Value from this parameter block */
        value?: string | number;
        /** Parameter block sub parameters blocks */
        params?: IParameterBlocks[];
    }
    export type IParameterBlockTypes = IProfileParameterBlock | IConstantParameterBlock | IIOReadParameterBlock | IAdditionParameterBlock | IMultiplyParameterBlock | IReverseParameterBlock | IConditionalParameterBlock | IVariableParameterBlock | ISlotLifetimeParameterBlock | IMaintenanceParameterBlock | ISlotProductStatusParameterBlock | IConstantStringParameterBlock;
    /** All the parameters blocks */
    export type IParameterBlocks = INumericParameterBlock | IStringParameterBlock;
    /** Parameter Blocks that return a number from data() */
    export type INumericParameterBlock = (IProfileParameterBlock | IConstantParameterBlock | IIOReadParameterBlock | IAdditionParameterBlock | IMultiplyParameterBlock | IReverseParameterBlock | IConditionalParameterBlock | IVariableParameterBlock | ISlotLifetimeParameterBlock | IMaintenanceParameterBlock);
    /** Parameters Blocks that return a string value from data() */
    export type IStringParameterBlock = (ISlotProductStatusParameterBlock | IConstantStringParameterBlock);
}
declare module "programblocks/ProgramBlocks/IForLoopProgramBlock" {
    import { INumericParameterBlock } from "IParameterBlock";
    import { IProgramBlock, IProgramBlocks } from "IProgramBlock";
    export interface IForLoopProgramBlock extends IProgramBlock {
        name: "for";
        currentIteration?: number;
        params: [INumericParameterBlock];
        blocks: IProgramBlocks[];
    }
}
declare module "programblocks/ProgramBlocks/IGroupProgramBlock" {
    import { IProgramBlock, IProgramBlocks } from "IProgramBlock";
    export interface IGroupProgramBlock extends IProgramBlock {
        name: "group";
        blocks: IProgramBlocks[];
    }
}
declare module "programblocks/ProgramBlocks/IIfProgramBlock" {
    import { INumericParameterBlock, IStringParameterBlock } from "IParameterBlock";
    import { IProgramBlock, IProgramBlocks } from "IProgramBlock";
    export interface IIfProgramBlock extends IProgramBlock {
        name: "if";
        params: [INumericParameterBlock, IStringParameterBlock, INumericParameterBlock];
        trueBlocks: IProgramBlocks[];
        falseBlocks: IProgramBlocks[];
    }
}
declare module "programblocks/ProgramBlocks/IIOProgramBlock" {
    import { INumericParameterBlock, IStringParameterBlock } from "IParameterBlock";
    import { IProgramBlock } from "IProgramBlock";
    export interface IIOProgramBlock extends IProgramBlock {
        name: "io";
        params: [IStringParameterBlock, INumericParameterBlock];
    }
}
declare module "programblocks/ProgramBlocks/IMaintenanceProgramBlock" {
    import { INumericParameterBlock, IStringParameterBlock } from "IParameterBlock";
    import { IProgramBlock } from "IProgramBlock";
    export interface IMaintenanceProgramBlock extends IProgramBlock {
        name: "maintenance";
        params: [IStringParameterBlock, INumericParameterBlock];
    }
}
declare module "programblocks/ProgramBlocks/IPassiveProgramBlock" {
    import { IStringParameterBlock, INumericParameterBlock } from "IParameterBlock";
    import { IProgramBlock } from "IProgramBlock";
    export interface IPassiveProgramBlock extends IProgramBlock {
        name: "passive";
        params: [
            IStringParameterBlock,
            INumericParameterBlock,
            INumericParameterBlock
        ];
    }
}
declare module "programblocks/ProgramBlocks/ISleepProgramBlock" {
    import { INumericParameterBlock } from "IParameterBlock";
    import { IProgramBlock } from "IProgramBlock";
    export interface ISleepProgramBlock extends IProgramBlock {
        name: "sleep";
        params: [INumericParameterBlock];
    }
}
declare module "programblocks/ProgramBlocks/ISlotLoadProgramBlock" {
    import { IStringParameterBlock } from "IParameterBlock";
    import { IProgramBlock } from "IProgramBlock";
    export interface ISlotLoadProgramBlock extends IProgramBlock {
        name: "slotLoad";
        params: [IStringParameterBlock];
    }
}
declare module "programblocks/ProgramBlocks/ISlotUnloadProgramBlock" {
    import { IStringParameterBlock } from "IParameterBlock";
    import { IProgramBlock } from "IProgramBlock";
    export interface ISlotUnloadProgramBlock extends IProgramBlock {
        name: "slotUnload";
        params: [IStringParameterBlock];
    }
}
declare module "programblocks/ProgramBlocks/IStartTimerProgramBlock" {
    import { INumericParameterBlock, IStringParameterBlock } from "IParameterBlock";
    import { IProgramBlock, IProgramBlocks } from "IProgramBlock";
    export interface IStartTimerProgramBlock extends IProgramBlock {
        name: "startTimer";
        params: [IStringParameterBlock, INumericParameterBlock];
        blocks: IProgramBlocks[];
    }
}
declare module "programblocks/ProgramBlocks/IStopProgramBlock" {
    import { IStringParameterBlock } from "IParameterBlock";
    import { IProgramBlock } from "IProgramBlock";
    export interface IStopProgramBlock extends IProgramBlock {
        name: "stop";
        params: [IStringParameterBlock];
    }
}
declare module "programblocks/ProgramBlocks/IStopTimerProgramBlock" {
    import { IStringParameterBlock } from "IParameterBlock";
    import { IProgramBlock } from "IProgramBlock";
    export interface IStopTimerProgramBlock extends IProgramBlock {
        name: "stopTimer";
        params: [IStringParameterBlock];
    }
}
declare module "programblocks/ProgramBlocks/IVariableProgramBlock" {
    import { INumericParameterBlock, IStringParameterBlock } from "IParameterBlock";
    import { IProgramBlock } from "IProgramBlock";
    export interface IVariableProgramBlock extends IProgramBlock {
        name: "variable";
        params: [IStringParameterBlock, INumericParameterBlock];
    }
}
declare module "programblocks/ProgramBlocks/IWhileLoopProgramBlock" {
    import { INumericParameterBlock, IStringParameterBlock } from "IParameterBlock";
    import { IProgramBlock, IProgramBlocks } from "IProgramBlock";
    export interface IWhileLoopProgramBlock extends IProgramBlock {
        name: "while";
        params: [INumericParameterBlock, IStringParameterBlock, INumericParameterBlock];
        blocks: IProgramBlocks[];
    }
}
declare module "IProgramBlock" {
    import { IParameterBlocks } from "IParameterBlock";
    import { IForLoopProgramBlock } from "programblocks/ProgramBlocks/IForLoopProgramBlock";
    import { IGroupProgramBlock } from "programblocks/ProgramBlocks/IGroupProgramBlock";
    import { IIfProgramBlock } from "programblocks/ProgramBlocks/IIfProgramBlock";
    import { IIOProgramBlock } from "programblocks/ProgramBlocks/IIOProgramBlock";
    import { IMaintenanceProgramBlock } from "programblocks/ProgramBlocks/IMaintenanceProgramBlock";
    import { IPassiveProgramBlock } from "programblocks/ProgramBlocks/IPassiveProgramBlock";
    import { ISleepProgramBlock } from "programblocks/ProgramBlocks/ISleepProgramBlock";
    import { ISlotLoadProgramBlock } from "programblocks/ProgramBlocks/ISlotLoadProgramBlock";
    import { ISlotUnloadProgramBlock } from "programblocks/ProgramBlocks/ISlotUnloadProgramBlock";
    import { IStartTimerProgramBlock } from "programblocks/ProgramBlocks/IStartTimerProgramBlock";
    import { IStopProgramBlock } from "programblocks/ProgramBlocks/IStopProgramBlock";
    import { IStopTimerProgramBlock } from "programblocks/ProgramBlocks/IStopTimerProgramBlock";
    import { IVariableProgramBlock } from "programblocks/ProgramBlocks/IVariableProgramBlock";
    import { IWhileLoopProgramBlock } from "programblocks/ProgramBlocks/IWhileLoopProgramBlock";
    export type ProgramBlockNames = "default" | "for" | "while" | "if" | "sleep" | "io" | "maintenance" | "stop" | "variable" | "startTimer" | "stopTimer" | "group" | "slotLoad" | "slotUnload" | "passive";
    export interface IProgramBlock {
        name: ProgramBlockNames;
        params?: IParameterBlocks[];
        blocks?: IProgramBlocks[];
        executed?: boolean;
    }
    export type IProgramBlocks = (IForLoopProgramBlock | IWhileLoopProgramBlock | IGroupProgramBlock | IStopProgramBlock | IStopTimerProgramBlock | IStartTimerProgramBlock | IIfProgramBlock | IVariableProgramBlock | IIOProgramBlock | IMaintenanceProgramBlock | ISlotLoadProgramBlock | ISlotUnloadProgramBlock | ISleepProgramBlock | IPassiveProgramBlock);
}
declare module "IProgramStep" {
    import { INumericParameterBlock } from "IParameterBlock";
    import { IProgramBlocks } from "IProgramBlock";
    export interface IProgramStep {
        /** Program Step name */
        name: string;
        /** Parameter block that indicates if this step is enabled in the PBR flow */
        isEnabled: INumericParameterBlock;
        /** Parameter block that indicates the estimated Step duration time*/
        duration: INumericParameterBlock;
        /** Optional Parameter block that tells the PBR if this steps must be runt multiple times */
        runAmount?: INumericParameterBlock;
        /** Program Blocks array that are executed at the start of a step */
        startBlocks: IProgramBlocks[];
        /** Program Blocks array that are executed at the end of a step */
        endBlocks: IProgramBlocks[];
        /** Program blocks Array that is executed by this step */
        blocks: IProgramBlocks[];
    }
    export interface IProgramStepRunner extends IProgramStep {
        startTime?: number;
        endTime?: number;
        runCount?: number;
        state?: EProgramStepState;
        type?: EProgramStepType;
    }
    export interface IProgramStepInformations {
        isEnabled: boolean;
        type?: string;
        state?: string;
        duration?: number;
        startTime?: number;
        endTime?: number;
        runAmount?: number;
        runCount?: number;
    }
    /** Step state */
    export enum EProgramStepState {
        /** Created but not executed yet */
        CREATED = "created",
        /** Currently being executed */
        STARTED = "started",
        /** Partialy ended, this steps will be executed again */
        PARTIAL = "partial",
        /** Step is disabled */
        DISABLED = "disabled",
        /** Step was skipped */
        SKIPPED = "skipped",
        /** Step is being ended by force */
        ENDING = "ending",
        /** Step has ended */
        ENDED = "ended"
    }
    /** Step Type Programaticaly given by the RunAmount parameter of a step */
    export enum EProgramStepType {
        SINGLE = "single",
        MULTIPLE = "multiple"
    }
    /** Result from a step execution */
    export enum EProgramStepResult {
        /** Step is partialy ended, it wil be re-executed another time */
        PARTIAL_END = "partial",
        /** Step has ended */
        ENDED = "ended"
    }
}
declare module "programblocks/startchain/IPBRSCCheckChain" {
    import { IParameterBlocks } from "IParameterBlock";
    export interface IPBRSCCheckChain {
        name: "parameter" | "io";
        parameter?: IParameterBlocks;
        io?: {
            gateName: string;
            gateValue: number;
        };
    }
}
declare module "programblocks/startchain/IPBRStartCondition" {
    import { IPBRSCCheckChain } from "programblocks/startchain/IPBRSCCheckChain";
    export enum EPBRStartConditionResult {
        GOOD = "good",
        WARNING = "warning",
        ERROR = "error"
    }
    export interface IPBRStartCondition {
        conditionName: string;
        startOnly: boolean;
        checkChain: IPBRSCCheckChain;
    }
}
declare module "IProgramBlockRunner" {
    import { IProgramBlock } from "IProgramBlock";
    import { IProgramStep } from "IProgramStep";
    import { IPBRStartCondition } from "programblocks/startchain/IPBRStartCondition";
    export interface IPBRPremades {
        name: string;
        profile: string;
        cycle: string;
    }
    export interface IPBRStatus {
        mode: EPBRMode;
        estimatedRunTime?: number;
        startDate?: number;
        endDate?: number;
        endReason?: string;
        progress?: number;
    }
    export interface IProgram {
        name: string;
        profileRequired: boolean;
        startConditions: IPBRStartCondition[];
        steps: IProgramStep[];
    }
    export interface IProgramRunner extends IProgram {
        status: IPBRStatus;
        timers?: IProgramTimer[];
        variables?: IProgramVariable[];
        currentStepIndex?: number;
    }
    export enum EPBRMode {
        CREATED = "created",
        STARTED = "started",
        ENDING = "ending",
        ENDED = "ended"
    }
    export interface IProgramVariable {
        name: string;
        value: number;
    }
    export interface IProgramTimer {
        name: string;
        enabled: boolean;
        blocks: IProgramBlock[];
    }
}
declare module "nusterData/ICallToAction" {
    /** Call to action inteface */
    export interface ICallToAction {
        /** Name of this CTA */
        name: string;
        /** API Endpoint to be reached by the CTA (NusterTurbine Endpoints) */
        APIEndpoint?: {
            /** URL Reached */
            url: string;
            /** HTTP Request Method */
            method: "get" | "put" | "post" | "delete";
        };
        /** UIEndpoint reached by the CTA (NusterDesktop Endpoints)*/
        UIEndpoint?: string;
    }
}
declare module "ISlot" {
    import { ICallToAction } from "nusterData/ICallToAction";
    /** Slot definition used in config */
    export interface IConfigSlot {
        /** Slots name */
        name: string;
        /** Slot type */
        type: string;
        /** Production options, If this is set the slot become productable */
        productOptions?: ISlotProductOptions;
        /** Sensors available for this Slots */
        sensors: ISlotSensor[];
        /** Call to action, For UI Purposes only */
        callToAction?: ICallToAction[];
    }
    /** Slot data for productable slots */
    export interface ISlotProductData {
        /** Product series */
        productSeries: EProductSeries;
        /** Porduct load date */
        loadDate: Date;
        /** Product lifetime progress (between 0 and 1) */
        lifetimeProgress: number;
        /** Product lifetime remaining in Milliseconds */
        lifetimeRemaining: number;
    }
    /** Data returned from slot manager */
    export type ISocketSlot = IConfigSlot & {
        slotData?: ISlotProductData;
    };
    /** Product series TODO: Make this only available for offline devices */
    export enum EProductSeries {
        LLC = "llc",
        USL = "usl",
        TC = "tc",
        BC = "bc",
        WR = "wr",
        CR = "cr"
    }
    /** Slot Sensor interface */
    export interface ISlotSensor {
        /** IO gate name of this sensor */
        io: string;
        /** Slot type */
        type: ESlotSensorType;
        /** Slot value */
        value?: number;
    }
    /** Slot sensor type */
    export enum ESlotSensorType {
        LEVEL_NUMERIC_MIN = "level-min-n",
        LEVEL_NUMERIC_MAX = "level-max-n",
        LEVEL_ANALOG = "level-a",
        PRESENCY_NUMERIC = "level-np",
        TEMPERATURE = "temperature"
    }
    /** Slot product options */
    export interface ISlotProductOptions {
        /** Lifespan of the product in days if -1, no lifespan, count the life since the product hass been installed */
        lifespan: number;
        /** Default product series */
        defaultProductSeries: EProductSeries;
    }
}
declare module "webSocketData/index" {
    import { IDeviceData } from "balena/IDeviceData";
    import { IHypervisorData } from "balena/IHypervisorDevice";
    import { IVPNData } from "balena/IVPNData";
    import { IOGates } from "gates/IIOGate";
    import { IConfiguration } from "IConfiguration";
    import { IIOPhysicalController } from "IIOControllers";
    import { ISocketMaintenance } from "IMaintenance";
    import { ISocketManual } from "IManualMode";
    import { ISocketPassive } from "IPassive";
    import { IProfileExportable } from "IProfile";
    import { IProgramRunner } from "IProgramBlockRunner";
    import { ISocketSlot } from "ISlot";
    export interface IWebSocketData {
        type: "message" | "status" | "popup";
        message: IStatusMessage | IPopupMessage | unknown;
    }
    export interface IStatusMessage {
        machine: IConfiguration & {
            hypervisorData?: IHypervisorData;
            vpnData?: IVPNData;
            deviceData?: IDeviceData;
            nusterVersion: string;
        };
        cycle?: IProgramRunner;
        slots: ISocketSlot[];
        profiles: IProfileExportable[];
        io: IOGates[];
        handlers: IIOPhysicalController[];
        passives: ISocketPassive[];
        manuals: ISocketManual[];
        maintenances: ISocketMaintenance[];
    }
    export interface IPopupMessage {
        /** Unique identifier to prevent multiple pop ups */
        identifier: string;
        /** i18n text, title of this pop up */
        title: string;
        /** i18n message, body of this popup */
        message: string;
        /** Call to actions */
        callToAction?: {
            /** Name of this CTA */
            name: string;
            /** API Endpoint to be reached by the CTA (NusterTurbine Endpoints) */
            APIEndpoint?: {
                /** URL Reached */
                url: string;
                /** HTTP Request Method */
                method: "get" | "put" | "post" | "delete";
            };
            /** UIEndpoint reached by the CTA (NusterDesktop Endpoints)*/
            UIEndpoint?: string;
        }[];
    }
}
