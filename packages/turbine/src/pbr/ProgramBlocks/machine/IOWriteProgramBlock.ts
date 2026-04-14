import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllProgramBlocks, IOWriteProgramBlock as IOWriteProgramBlockSpec } from "$types/spec/cycle/program";
import type { PBRContext } from "../../../services/PBRContext";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import { ProgramBlock } from "../ProgramBlock";

export class IOWriteProgramBlock extends ProgramBlock
{
    gateName: StringParameterBlockHydrated;
    gateValue: NumericParameterBlockHydrated;

    estimatedRunTime = 0.01; // 10ms io write read time

    constructor(obj: IOWriteProgramBlockSpec, ctx?: PBRContext) {

        super(obj, ctx);

        this.gateName = ParameterBlockRegistry.String(obj.io_write[0]);
        this.gateValue = ParameterBlockRegistry.Numeric(obj.io_write[1]);
    }

    public async execute(signal?: AbortSignal): Promise<void> {

        const gateName = this.gateName.data;
        const gateValue = this.gateValue.data;

        if (this.ctx) {
            // Direct path — no events, no callbacks, no timers
            this.ctx.logger.log("info", `IOWriteBlock: Will access ${gateName} to write ${gateValue}.`);

            try {
                await this.ctx.io.write(gateName, gateValue);
            } catch (err) {
                this.ctx.logger.log("warning", `IOWriteBlock: ${gateName} write failed: ${(err as Error).message}`);
                this.ctx.stop("controllerError");
            }
        } else {
            // Legacy event-based path with retry/timeout
            TurbineEventLoop.emit("log", "info", `IOWriteBlock: Will access ${gateName} to write ${gateValue}.`);

            await new Promise<void>(resolve => {
                let settled = false;

                const retryTimer: ReturnType<typeof setTimeout> = setTimeout(() => {
                    if (!settled && this.executed !== true) {
                        TurbineEventLoop.emit("log", "warning", `IOWriteBlock: ${gateName} write retry.`);
                        TurbineEventLoop.emit(`io.update.${this.gateName.data}`, {
                            value: gateValue,
                            callback: () => settle()
                        });
                    }
                }, 1000);

                const timeoutTimer: ReturnType<typeof setTimeout> = setTimeout(() => {
                    if (!settled && this.executed !== true) {
                        TurbineEventLoop.emit("log", "warning", `IOWriteBlock: ${gateName} write timeout.`);
                        TurbineEventLoop.emit("pbr.stop", "controllerError");
                        settle();
                    }
                }, 2000);

                const abortCheckTimer: ReturnType<typeof setInterval> = setInterval(() => {
                    if (signal?.aborted === true && this.executed === false) {
                        settle();
                    }
                }, 250);

                const settle = () => {
                    if (!settled) {
                        settled = true;
                        clearTimeout(retryTimer);
                        clearTimeout(timeoutTimer);
                        clearInterval(abortCheckTimer);
                        resolve();
                    }
                };

                TurbineEventLoop.emit(`io.update.${this.gateName.data}`, {
                    value: gateValue,
                    callback: () => settle()
                });
            });
        }

        super.execute();
    }

    static isIOWritePgB(obj: AllProgramBlocks): obj is IOWriteProgramBlockSpec
    {
        return (obj as IOWriteProgramBlockSpec).io_write !== undefined;
    }
}