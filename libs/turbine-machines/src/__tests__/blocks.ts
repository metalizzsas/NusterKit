import fs from "fs";
import path from "path";

import { matchers } from 'jest-json-schema';

import type { IMachineSpecs } from "@metalizzsas/nuster-typings/build/spec";
import { AllProgramBlocks } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlocks";
import { ParameterBlockRegistry } from "@metalizzsas/nuster-turbine/src/pbr/ParameterBlocks/ParameterBlockRegistry";
import { ProgramBlockRegistry } from "@metalizzsas/nuster-turbine/src/pbr/ProgramBlocks/ProgramBlockRegistry";
import { AllParameterBlocks } from "@metalizzsas/nuster-typings/build/spec/cycle/IParameterBlocks";

expect.extend(matchers);

interface Specs {
    model: string;
    variant: string;
    revision: string;
    file: string;
}

let files = fs.readdirSync(path.resolve("data"), { withFileTypes: true });

let filesToCheck: Specs[] = [];

for(const f of files.filter(f => f.isDirectory()))
{
    let files2 = fs.readdirSync(path.resolve("data", f.name), { withFileTypes: true });

    for(const f2 of files2.filter(f2 => f2.isDirectory()))
    {
        let files3 = fs.readdirSync(path.resolve("data", f.name, f2.name), { withFileTypes: true });

        for(const f3 of files3.filter(f3 => f3.isDirectory()))
        {
            let files4 = fs.readdirSync(path.resolve("data", f.name, f2.name, f3.name), { withFileTypes: true });

            for(const f4 of files4.filter(f4 => f4.isFile() && f4.name == "specs.json"))
            {
                filesToCheck.push({
                    model: f.name,
                    variant: f2.name,
                    revision: f3.name,
                    file: path.resolve("data", f.name, f2.name, f3.name, "specs.json"),
                });
            }
        }
    }
}

function validateBlock(obj: AllProgramBlocks)
{
    expect(ProgramBlockRegistry(obj)).not.toThrow();
}

function validateParameterBlock(obj: AllParameterBlocks)
{
    expect(ParameterBlockRegistry.All(obj)).not.toThrow();
}

for(const file of filesToCheck)
{
    const json = JSON.parse(fs.readFileSync(file.file, {encoding: "utf-8"})) as IMachineSpecs;

    const gateNames = json.iogates.map(m => m.name);

    const inputGateNames = json.iogates.filter(g => g.bus == "in").map(m => m.name);

    it('validating ' + file.model + ' ' + file.variant.toUpperCase() + ' R' + file.revision + ' Manual controls', () => {

        const manualNames = json.manual.map(m => m.name);

        json.manual.forEach(m => {
            m.controls.forEach(c => {
                if(typeof c == "string")
                {
                    expect(gateNames).toContain(c);
                }
                else
                {
                    expect(gateNames).toContain(c.name);
                }
            });

            if(m.requires !== undefined)
            {
                m.requires.forEach(r => {
                    expect(manualNames).toContain(r);
                });
            }

            if(m.incompatibility !== undefined)
            {
                m.incompatibility.forEach(i => {
                    expect(manualNames).toContain(i);
                });
            }

            if(m.watchdog !== undefined)
            {
                m.watchdog.forEach(w => {
                    expect(gateNames).toContain(w.gateName);
                });
            }
        });
    });

    it('validating ' + file.model + ' ' + file.variant.toUpperCase() + ' R' + file.revision + ' IO Blocks', () => {
        json.cycleTypes.forEach(c => {
            c.steps.forEach(s => {
                s.blocks.forEach(b => {
                    validateBlock(b);
                });
                s.startBlocks.forEach(b => {
                    validateBlock(b);
                });
                s.endBlocks.forEach(b => {
                    validateBlock(b);
                });
            });
        });
    });

    it('validating ' + file.model + ' ' + file.variant.toUpperCase() + ' R' + file.revision + ' Profile fields', () => {

        const fields: {[x: string]: string[]} = {};

        json.profileSkeletons.forEach(p => {
            fields[p.name] = p.fields.flatMap(f => f.name);
        });

        json.cycleTypes.forEach(c => {
            if(c.profileRequired !== false)
            {
                c.steps.forEach(s => {
                    validateParameterBlock(s.duration);
                    validateParameterBlock(s.isEnabled);

                    if(s.runAmount !== undefined)
                        validateParameterBlock(s.runAmount);

                    for(const b of s.blocks)
                    {
                        validateBlock(b);
                    }
                    
                    for(const b of s.startBlocks)
                    {
                        validateBlock(b);
                    }
                    for(const b of s.endBlocks)
                    {
                        validateBlock(b);
                    }
                });
            }
        });
    });

    it('validating ' + file.model + ' ' + file.variant.toUpperCase() + ' R' + file.revision + ' Slots sensors', () => {

        for(const slot of json.slots.filter(s => s.sensors !== undefined))
        {
            for(const sensor of slot.sensors!)
            {
                expect(inputGateNames).toContain(sensor.io);

                if(sensor.regulation !== undefined)
                {
                    for(const t of [sensor.regulation.actuators.plus, sensor.regulation.actuators.minus])
                    {
                        if(t === undefined)
                            continue;
                        
                        if(typeof t == "string")
                            expect(gateNames).toContain(t);
                        else
                        {
                            for(const p2 of t)
                            {
                                expect(gateNames).toContain(p2);
                            }
                        }
                    }
                    if(sensor.regulation.manualModes !== undefined)
                    {
                        for(const m of sensor.regulation.manualModes)
                        {
                            expect(json.manual.map(m => m.name)).toContain(m);
                        }
                    }
                }
            }
        }
    });

    it('validating ' + file.model + ' ' + file.variant.toUpperCase() + ' R' + file.revision + ' Cycle security conditions', () => {

        for(const cycle of json.cycleTypes)
        {
            for(const sc of cycle.startConditions)
            {
                if(sc.checkchain.io !== undefined)
                {
                    expect(inputGateNames).toContain(sc.checkchain.io.gateName);
                }
            }
        }
    });

    it('validating ' + file.model + ' ' + file.variant.toUpperCase() + ' R' + file.revision + ' Cycle additional informations', () => {

        for(const cycle of json.cycleTypes)
        {
            if(cycle.additionalInfo)
            {
                for(const ai of cycle.additionalInfo)
                {
                    if(ai.name == "gate")
                    {
                        expect(inputGateNames).toContain(ai.value);
                    }
                }
            }
        }
    });
}