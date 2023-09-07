import type { MachineSpecs } from "@metalizzsas/nuster-typings/build/spec";
import type { AllProgramBlocks } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ProgramBlocks";
import type { NumericParameterBlocks, StatusParameterBlocks, StringParameterBlocks } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";

import { Machines } from "..";

for(const machine of Object.keys(Machines))
{
    // @ts-ignore
    const machineSpec = Machines[machine] as MachineSpecs | undefined;

    if(machineSpec === undefined)
        continue;

    test(`Validating ${machine} profile fields`, () => {

        for(const premade of machineSpec.profilePremades)
        {
            const profileSkeleton = machineSpec.profileSkeletons.find(k => k.name === premade.skeleton);
            expect(premade.skeleton).toBe(profileSkeleton?.name);

            let profileSkeletonFieldNames = profileSkeleton!.fields.map(k => k.name);

            for(const profileField of premade.values)
            {
                const fieldSkeleton = profileSkeleton?.fields.find(k => k.name === profileField.key);
                profileSkeletonFieldNames = profileSkeletonFieldNames.filter(k => k !== profileField.key);
                expect(profileField.key).toBe(fieldSkeleton?.name);
            }

            expect(profileSkeletonFieldNames?.length).toBe(0);
        }        
    });

    test(`Validating ${machine} container sensors`, () => {

        for(const container of machineSpec.containers)
        {
            if(container.sensors)
            {
                for(const sensor of container.sensors)
                {
                    const attachedGate = machineSpec.iogates.find(k => k.name === sensor.io);
                    expect(sensor.io).toBe(attachedGate?.name)
                }
            }

            if(container.regulations)
            {
                for(const regulation of container.regulations)
                {
                    const regulationIO = [
                        ...regulation.plus, 
                        ...regulation.active, 
                        regulation.security.map(s => s.name), 
                        ...regulation.minus,
                        regulation.sensor
                    ];

                    for(const io of regulationIO)
                    {
                        const attachedGate = machineSpec.iogates.find(k => k.name === io);
                        expect(io).toBe(attachedGate?.name)
                    }
                }
            }
        }
    });

    test(`Validating ${machine} Cycle security conditions`, () => {

        for(const cycle of machineSpec.cycleTypes)
        {
            for(const sc of [...cycle.runConditions, ...cycle.steps.filter(s => s.runConditions != undefined).flatMap(s => s.runConditions ?? [])])
            {
                if(sc.checkchain.io !== undefined)
                {
                    const attachedGate = machineSpec.iogates.find(k => k.name === sc.checkchain.io?.gateName);
                    expect(attachedGate?.name).toBe(sc.checkchain.io.gateName);
                }
                else if (sc.checkchain.parameter !== undefined)
                {
                    const validator = new BlockValidator(machineSpec, cycle.name);
                    validator.validateStatusParameterBlock(sc.checkchain.parameter);
                }
            }
        }
    });

    test(`Validating ${machine} cycles premades`, () => {

        for(const premadeCycle of machineSpec.cyclePremades)
        {
            if(premadeCycle.profile === undefined)
                continue;

            const profile = machineSpec.profilePremades.find(k => k.id === premadeCycle.profile);
            expect(profile?.id).toBe(premadeCycle.profile);
        }
    });

    test(`Validating ${machine} Cycle blocks`, () => {
        for(const cycle of machineSpec.cycleTypes)
        {
            const validator = new BlockValidator(machineSpec, cycle.name);

            for(const step of cycle.steps)
            {
                validator.validateNumericParameterBlock(step.isEnabled);
                if(step.runAmount)
                    validator.validateNumericParameterBlock(step.runAmount);

                for(const block of [...step.startBlocks, ...step.blocks, ...step.endBlocks])
                {
                    validator.validateProgramBlock(block)
                }
            }
        }
    });

    test(`Validating ${machine} Cycle additional informations`, () => {

        for(const cycle of machineSpec.cycleTypes)
        {
            if(cycle.additionalInfo)
            {
                for(const ai of cycle.additionalInfo)
                {
                    const addtionalInfoGate = machineSpec.iogates.find(k => k.name === ai);
                    expect(ai).toBe(addtionalInfoGate?.name);
                }
            }
        }
    });
}

class BlockValidator
{
    machineConfig: MachineSpecs;
    cycleName: string;

    constructor(context: MachineSpecs, cycleName: string)
    {
        this.machineConfig = context;
        this.cycleName = cycleName;
    }

    /**
     * Unwraps string blocks values
     * @param block String blocks
     * @returns string extracted
     */
    unwrapString(block: StringParameterBlocks): string
    {
        if(typeof block === "string")
            return block;
        else
            return block.string;
    }

    /**
     * Test string parameter blocks validity agaisnt their context
     * @param block block to be validated
     */
    validateStringParameterBlock(block: StringParameterBlocks)
    {
        if(typeof block === "string")
            return;

        expect(typeof block.string).toBe("string");
    }

    /**
     * Validates a status block against its context
     * @param block Status block to be validated
     */
    validateStatusParameterBlock(block: StatusParameterBlocks)
    {
        if('maintenance_status' in block)
        {
            if(block.maintenance_status instanceof Array)
            {
                expect(block.maintenance_status.length).toBe(2);

                const taskName = this.unwrapString(block.maintenance_status[0]);
                const maintenanceTask = this.machineConfig.maintenance.find(k => k.name === taskName);
                expect(maintenanceTask?.name).toBe(taskName);
                return;
            }
            else
            {
                const taskName = this.unwrapString(block.maintenance_status);
                const maintenanceTask = this.machineConfig.maintenance.find(k => k.name === this.unwrapString(taskName));
                expect(maintenanceTask?.name).toBe(taskName);
                return;
            }
        }

        if('product_status' in block)
        {
            const container = this.machineConfig.containers.filter(k => k.supportedProductSeries !== undefined).find(k => k.name === this.unwrapString(block.product_status));
            expect(container?.name).toBe(this.unwrapString(block.product_status));
            return;
        }

        console.error(block, "is not tested");
        return false;
    }

    /**
     * Validates numeric blocks
     * @param block Numeric block to be validated
     */
    validateNumericParameterBlock(block: NumericParameterBlocks): void
    {
        if(typeof block === "number")
            return;

        if('multiply' in block)
        {
            block.multiply.forEach(this.validateNumericParameterBlock.bind(this));
            return;
        }

        if('divide' in block)
        {
            expect(block.divide[1]).not.toBe(0);
            this.validateNumericParameterBlock(block.divide[0]);
            return;
        }

        if('add' in block)
        {
            block.add.forEach(this.validateNumericParameterBlock.bind(this));
            return;
        }

        if('sub' in block)
        {
            this.validateNumericParameterBlock(block.sub[0]);
            this.validateNumericParameterBlock(block.sub[1]);
            return;
        }

        if('reverse' in block)
        {
            this.validateNumericParameterBlock(block.reverse);
            return;
        }

        if('profile' in block)
        {
            const profileAttached = this.machineConfig.profileSkeletons.find(k => k.name === this.cycleName);

            expect(profileAttached).not.toBe(undefined);

            if(profileAttached === undefined)
                return;

            const profileFieldName = this.unwrapString(block.profile);
            const profileFieldAttached = profileAttached.fields.find(k => k.name === profileFieldName)

            expect(profileFieldAttached?.name).toBe(profileFieldName);
            return;
        }
        
        if('io_read' in block)
        {
            const gateName = this.unwrapString(block.io_read);
            const gate = this.machineConfig.iogates.find(k => k.name === gateName)
            expect(gate?.name).toBe(gateName);
            return;
        }

        if('conditional' in block)
        {
            [...block.conditional.left_side, ...block.conditional.right_side].forEach(this.validateNumericParameterBlock.bind(this));
            return;
        }

        if('read_var' in block)
        {
            this.validateStringParameterBlock(block.read_var);
            return;
        }

        if('read_machine_var' in block)
        {
            this.validateStringParameterBlock(block.read_machine_var);
            return;
        }

        console.log(block, "is not tested");
    }
    
    /**
     * Test a program block validity against its context
     * @param block program block to be validated
     */
    validateProgramBlock(block: AllProgramBlocks): void
    {
        const cycleAttached = this.machineConfig.cycleTypes.find(k => k.name === this.cycleName);
        expect(cycleAttached).not.toBe(undefined);

        if(cycleAttached === undefined)
            return;

        if('for' in block)
        {
            this.validateNumericParameterBlock(block.for.limit);
            block.for.blocks.forEach(this.validateProgramBlock.bind(this));
            return;
        }
        
        if('while' in block)
        {
            this.validateNumericParameterBlock(block.while.statement.left_side);
            this.validateNumericParameterBlock(block.while.statement.right_side);

            block.while.blocks.forEach(this.validateProgramBlock.bind(this));
            return;
        }
        
        if('sleep' in block)
        {
            this.validateNumericParameterBlock(block.sleep);
            return;
        }
        
        if('stop' in block)
        {
            this.validateStringParameterBlock(block.stop);
            return;
        }
        
        if('if' in block)
        {
            [block.if.statement.left_side, block.if.statement.right_side].forEach(this.validateNumericParameterBlock.bind(this));

            block.if.true_blocks.forEach(this.validateProgramBlock.bind(this));
            block.if.false_blocks?.forEach(this.validateProgramBlock.bind(this));
            return;
        }

        if('io_write' in block)
        {
            const gateName = this.unwrapString(block.io_write[0]);
            const gate = this.machineConfig.iogates.find(k => k.name === gateName);

            expect(gate?.name).toBe(gateName);
            this.validateNumericParameterBlock(block.io_write[1]);
            return;
        }

        if('start_timer' in block)
        {
            this.validateStringParameterBlock(block.start_timer.timer_name);
            this.validateNumericParameterBlock(block.start_timer.timer_interval);
            block.start_timer.blocks.forEach(this.validateProgramBlock.bind(this));
            return;
        }

        if('stop_timer' in block)
        {
            this.validateStringParameterBlock(block.stop_timer);
            return;
        }

        if('append_maintenance' in block)
        {
            const maintenanceName = this.unwrapString(block.append_maintenance[0]);
            const maintenance = this.machineConfig.maintenance.find(k => k.name === maintenanceName);
            expect(maintenance?.name).toBe(maintenanceName);
            this.validateNumericParameterBlock(block.append_maintenance[1]);

            return;
        }

        if('load_container' in block)
        {
            const containerName = this.unwrapString(block.load_container[0]);
            const productName = this.unwrapString(block.load_container[1]);
            const container = this.machineConfig.containers.find(k => k.name === containerName);

            expect(container?.name).toBe(containerName);
            
            if(container)
            {
                expect(container.supportedProductSeries).toContain(productName);
            }

            return;
        }

        if('unload_container' in block)
        {
            const containerName = this.unwrapString(block.unload_container);
            const container = this.machineConfig.containers.find(k => k.name === containerName);

            expect(container?.name).toBe(containerName);
            return;
        }
        
        console.log(block, "is not tested");
    }
}