import { EventEmitter } from "node:events";
import type { ProfileHydrated } from "$types/hydrated/profiles";
import type { PBRMode } from "$types/hydrated/cycle/ProgramBlockRunnerHydrated";
import type { PBRStepState } from "$types/spec/cycle/PBRStep";
import type { ContainerHydrated } from "$types/hydrated/containers";
import type { MaintenanceHydrated } from "$types/hydrated/maintenance";
import type { IOGateJSON } from "$types/hydrated/io";
import type { CallToAction, Popup } from "$types/spec/nuster";
import type { MachineSpecs } from "$types/index";

export class EventLoop extends EventEmitter implements EventLoopEmitter
{
    constructor()
    {
        super();
        this.setMaxListeners(50);
    }

    on<U extends keyof EventLoopEvents>(event: U, listener: EventLoopEvents[U]): this
    {
        return super.on(event, listener);
    }

    once<U extends keyof EventLoopEvents>(event: U, listener: EventLoopEvents[U]): this
    {
        return super.once(event, listener);
    }

    emit<U extends keyof EventLoopEvents>(event: U, ...args: Parameters<EventLoopEvents[U]>): boolean
    {
        return super.emit(event, ...args);
    }
}

export declare interface EventLoopEmitter extends EventEmitter
{
    on<U extends keyof EventLoopEvents>(event: U, listener: EventLoopEvents[U]): this;
    once<U extends keyof EventLoopEvents>(event: U, listener: EventLoopEvents[U]): this;

    emit<U extends keyof EventLoopEvents>(event: U, ...args: Parameters<EventLoopEvents[U]>): boolean
}
/** Events Used in the `TurbineEventLoop` */
interface EventLoopEvents
{
    /** IO Controller events */
    "iocontroller.error": (error: string) => void;

    /** IO Events */
    [key: `io.read.${string}`]: (options: { callback?: (gate: IOGateJSON) => void | Promise<void> }) => void;

    [key: `io.updated.${string}`]: (gate: IOGateJSON) => void;

    [key: `io.update.${string}`]: (options: { value: number, lock?: boolean, callback?: () => void | Promise<void> }) => void;

    "io.resetAll": () => Promise<void>;
    "io.snapshot": (options: { callback: (snapshot: Record<string, number>) => void }) => void;

    /** Container events */
    [key: `container.read.${string}`]: (options: { callback?: (container: ContainerHydrated) => void | Promise<void> }) => void;
    
    [key: `container.load.${string}`]: (productSerie: string) => void;
    [key: `container.unload.${string}`]: () => void;
    [key: `container.updated.${string}`]: (container: ContainerHydrated) => void;

    /** Regulation container events */
    [key: `container.${string}.regulation.${string}.get_state`]: (options: {callback?: (state: boolean) => void | Promise<void> }) => void;
    [key: `container.${string}.regulation.${string}.state_updated`]: (state: boolean) => void;
    [key: `container.${string}.regulation.${string}.set_state`]: (options: {state: boolean, callback?: (state: boolean) => void | Promise<void>} ) => void;

    [key: `container.${string}.regulation.${string}.get_target`]: (options: {callback?: (target: number) => void | Promise<void> }) => void;
    [key: `container.${string}.regulation.${string}.target_updated`]: (target: number) => void;
    [key: `container.${string}.regulation.${string}.set_target`]: (options: {target: number, callback?: (target: number) => void | Promise<void>} ) => void;

    /** Maintenance events */
    [key: `maintenance.read.${string}`]: (options: {callback?: (maintenance: MaintenanceHydrated) => void | Promise<void> }) => void;

    [key: `maintenance.append.${string}`]: (value: number) => void;
    [key: `maintenance.updated.${string}`]: (maintenance: MaintenanceHydrated) => void;

    "profile.read": (options: {profileID: string, callback?: (profile?: ProfileHydrated) => void | Promise<void> }) => void;
    
    /** PBR Events */
    "pbr.profile.read": (options: { callback?: (profile?: ProfileHydrated ) => void | Promise<void> }) => void;

    "pbr.status.update": (status: PBRMode) => void;
    "pbr.step.status.update": (status: PBRStepState) => void;

    "pbr.timer.start": (timer: {name: string; timer: ReturnType<typeof setInterval>, enabled: boolean}) => void;
    "pbr.timer.stop": (options: { timerName: string, callback?: (stopped: boolean) => void | Promise<void>}) => void;
    "pbr.timer.exists": (options: { timerName: string, callback?: (exists: boolean) => void | Promise<void>}) => void;

    "pbr.variable.write": (options: { name: string, value: number }) => void;
    "pbr.variable.read": (options: { name: string, callback?: (value: number) => void | Promise<void> }) => void;

    "pbr.stop": (reason: string) => void;
    "pbr.nextStep": () => void;
    "pbr.pause": () => void;
    "pbr.resume": () => void;
    "pbr.setPausable": (pausable: boolean) => void;

    [key: `pbr.step.${string}.stop`]: (reason?: string) => void;    

    [key: `machine.read_variable.${string}`]: (options: { callback?: (value: number) => void | Promise<void> }) => void;

    "log": (level: "trace" | "info" | "warning" | "error" | "fatal", message: string) => void;

    "nuster.modal": (popup: Popup<CallToAction>) => void;

    "close": () => void;

    "machine.config": (callback: (config: MachineSpecs) => void) => void;
}