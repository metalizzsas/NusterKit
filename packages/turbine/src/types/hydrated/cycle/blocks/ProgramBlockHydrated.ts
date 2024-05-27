
export type ProgramBlockHydrated = {
    readonly name: string;
    estimatedRunTime: number;
    executed: boolean;
    earlyExit: boolean;

    execute(signal?: AbortSignal): void | Promise<void>
    toJSON(): ProgramBlockHydrated
}