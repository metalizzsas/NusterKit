import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, MaintenanceStatusParameterBlock as MaintenanceStatusParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import type { MaintenanceHydrated } from "@metalizzsas/nuster-typings/build/hydrated/maintenance";
import { StatusParameterBlock } from "../StatusParameterBlock";

export class MaintenanceStatusParameterBlock extends StatusParameterBlock
{
    private taskName: StringParameterBlockHydrated;
    private optional: NumericParameterBlockHydrated;

    #maintenanceTask?: MaintenanceHydrated;

    constructor(obj: MaintenanceStatusParameterBlockSpec)
    {
        super(obj);

        if(obj.maintenance_status instanceof Array)
        {
            this.taskName = ParameterBlockRegistry.String(obj.maintenance_status[0]);
            this.optional = ParameterBlockRegistry.Numeric(obj.maintenance_status[1]);
        }
        else
        {
            this.taskName = ParameterBlockRegistry.String(obj.maintenance_status);
            this.optional = ParameterBlockRegistry.Numeric(0);
        }

        TurbineEventLoop.on(`maintenance.updated.${this.taskName.data}`, (maintenance) => { 
            this.#maintenanceTask = maintenance;
            this.subscriber?.(this.data);
        });
        
        TurbineEventLoop.emit(`maintenance.read.${this.taskName.data}`, {callback: (maintenance) => {
            this.#maintenanceTask = maintenance;
            this.subscriber?.(this.data);
        }});
    }

    public get data(): "error" | "warning" | "good"
    {
        if(this.#maintenanceTask === undefined)
            return "error";

        if(this.#maintenanceTask.durationProgress === -1)
            return "warning";

        if(this.#maintenanceTask.durationProgress < 0.75)
            return "good";
        
        if(this.#maintenanceTask.durationProgress > 1)
            return (this.optional.data === 1) ? "warning" : "error";
        
        return "warning";
    }

    static isMaintenanceStatusPB(obj: AllParameterBlocks): obj is MaintenanceStatusParameterBlockSpec
    {
        return (obj as MaintenanceStatusParameterBlockSpec).maintenance_status !== undefined;
    }
}