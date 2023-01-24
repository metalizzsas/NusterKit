
export type ProgramBlockHydrated = {
    readonly name: string;
    estimatedRunTime: number;
    executed: boolean;
    earlyExit: boolean;

    execute(): void | Promise<void>
    toJSON(): ProgramBlockHydrated
}