import type { MachineSpecs } from "@metalizzsas/nuster-typings/build/spec";
import type { AllProgramBlocks, ForProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ProgramBlocks";
import type { AllParameterBlocks, IOReadParameterBlock, ProfileParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";

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

            for(const profileField of Object.keys(premade.values))
            {
                const fieldSkeleton = profileSkeleton?.fields.find(k => k.name === profileField)
                expect(profileField).toBe(fieldSkeleton?.name);
            }
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
            for(const sc of cycle.startConditions)
            {
                if(sc.checkchain.io !== undefined)
                {
                    const attachedGate = machineSpec.iogates.find(k => k.name === sc.checkchain.io?.gateName);
                    expect(attachedGate?.name).toBe(sc.checkchain.io.gateName);
                }
                else if (sc.checkchain.parameter !== undefined)
                {
                    const validator = new BlockValidator(machineSpec, "default");
                    expect(validator.validatePrBlock(sc.checkchain.parameter)).toBe(true);
                }
            }
        }
    });

    test(`Validating ${machine} Cycle blocks`, () => {
        for(const cycle of machineSpec.cycleTypes)
        {
            const validator = new BlockValidator(machineSpec, cycle.name);

            for(const step of cycle.steps)
            {
                expect(validator.validatePrBlock(step.isEnabled)).toBe(true);
                if(step.runAmount)
                    expect(validator.validatePrBlock(step.runAmount)).toBe(true);

                for(const block of [...step.startBlocks, ...step.blocks, ...step.endBlocks])
                {
                    expect(validator.validatePBlock(block)).toBe(true);
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
     * Test parameter blocks validity agaisnt their context
     * TODO: Impletement all parameter blocks
     * @param block block to be validated
     * @returns block validity
     */
    validatePrBlock(block: AllParameterBlocks): boolean
    {
        const cycleAttached = this.machineConfig.cycleTypes.find(k => k.name === this.cycleName); 

        if(cycleAttached === undefined)
            return false;

        if((block as ProfileParameterBlock).profile !== undefined)
        {
            const profileAttached = this.machineConfig.profileSkeletons.find(k => k.name === this.cycleName);

            if(profileAttached === undefined)
                return false;
            
            return (profileAttached.fields.find(k => k.name === (block as ProfileParameterBlock).profile) !== undefined);
        }
        else if((block as IOReadParameterBlock).io_read !== undefined)
        {
            return this.machineConfig.iogates.find(k => k.name === (block as IOReadParameterBlock).io_read) !== undefined;
        }
        else
        {
            return true;
        }
    }
    
    /**
     * Test a block validity against its context
     * TODO: Implents test for each blocks
     * @param block block to be validated
     * @returns block validity
     */
    validatePBlock(block: AllProgramBlocks): boolean
    {
        const cycleAttached = this.machineConfig.cycleTypes.find(k => k.name === this.cycleName);

        if(cycleAttached === undefined)
            return false;

        if((block as ForProgramBlock).for !== undefined)
        {
            const limitResult = this.validatePrBlock((block as ForProgramBlock).for.limit);
            return (block as ForProgramBlock).for.blocks.reduce((p, c) => this.validatePBlock(c) && p, limitResult);
        }
        else
        {
            return true;
        }
    }
}