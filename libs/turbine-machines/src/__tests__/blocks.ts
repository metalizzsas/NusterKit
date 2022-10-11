import fs from "fs";
import path from "path";

import { matchers } from 'jest-json-schema';

import { IMachineSpecs } from "@metalizzsas/nuster-typings/src/spec";
import { IProgramBlocks } from "@metalizzsas/nuster-typings/src/spec/cycle/IProgramBlock";
import { IParameterBlocks } from "@metalizzsas/nuster-typings/src/spec/cycle/IParameterBlock";
import { IConstantStringParameterBlock } from "@metalizzsas/nuster-typings/src/spec/cycle/programblocks/ParameterBlocks/IConstantStringParameterBlock";
import { IIfProgramBlock } from "@metalizzsas/nuster-typings/src/spec/cycle/programblocks/ProgramBlocks/IIfProgramBlock";

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

    it('validating ' + file.model + ' ' + file.variant.toUpperCase() + ' R' + file.revision + ' Passive controls', () => {
        json.passives.forEach(p => {

            for(const t of [p.actuators.plus, p.sensors, p.actuators.minus])
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

        function validateBlock(obj: IProgramBlocks)
        {
            if(obj.name == "io")
            {
                const gateName = obj.params[0] as IConstantStringParameterBlock;
                expect(gateNames).toContain(gateName.value);
            }
            
            if(obj.blocks !== undefined)
            {
                for(const b of obj.blocks)
                {
                    validateBlock(b);
                }

                if(obj.name == "if")
                {
                    for(const b of (obj as IIfProgramBlock).trueBlocks)
                    {
                        validateBlock(b);
                    }
                    for(const b of (obj as IIfProgramBlock).falseBlocks)
                    {
                        validateBlock(b);
                    }
                }
            }

            if(obj.params !== undefined)
            {
                for(const p of obj.params)
                {
                    validateParameterBlock(p);
                }
            }
        }

        function validateParameterBlock(obj: IParameterBlocks)
        {
            if(obj.name == "io")
            {
                expect(gateNames).toContain(obj.value);
            }
            else
            {
                if(obj.params !== undefined)
                {
                    for(const o of obj.params)
                    {
                        validateParameterBlock(o);
                    }
                }
            }
        }
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
                    validateParameterBlock(s.duration, c.name);
                    validateParameterBlock(s.isEnabled, c.name);

                    if(s.runAmount !== undefined)
                        validateParameterBlock(s.runAmount, c.name);

                    for(const b of s.blocks)
                    {
                        validateBlock(b, c.name);
                    }
                    
                    for(const b of s.startBlocks)
                    {
                        validateBlock(b, c.name);
                    }
                    for(const b of s.endBlocks)
                    {
                        validateBlock(b, c.name);
                    }
                });
            }
        });

        function validateBlock(obj: IProgramBlocks, profileName: string)
        {
            if(obj.params !== undefined)
            {
                for(const p of obj.params)
                {
                    validateParameterBlock(p, profileName);
                }
            }

            if(obj.blocks !== undefined)
            {
                for(const b of obj.blocks)
                {
                    validateBlock(b, profileName);
                }
            }

            if(obj.name == "if")
            {
                for(const b of obj.trueBlocks)
                {
                    validateBlock(b, profileName);
                }
                for(const b of obj.falseBlocks)
                {
                    validateBlock(b, profileName);
                }
            }
        }

        function validateParameterBlock(obj: IParameterBlocks, profileName: string)
        {
            if(obj.name == "profile")
            {
                expect(fields[profileName]).toContain(obj.value);
            }
            
            if(obj.params !== undefined)
            {
                for(const p of obj.params)
                {
                    validateParameterBlock(p, profileName);
                }
            }
        }
    });

    it('validating ' + file.model + ' ' + file.variant.toUpperCase() + ' R' + file.revision + ' Slots sensors', () => {

        for(const slot of json.slots)
        {
            for(const sensor of slot.sensors)
            {
                expect(inputGateNames).toContain(sensor.io);
            }
        }
    });

    it('validating ' + file.model + ' ' + file.variant.toUpperCase() + ' R' + file.revision + ' Cycle security conditions', () => {

        for(const cycle of json.cycleTypes)
        {
            for(const sc of cycle.startConditions)
            {
                if(sc.checkChain.name == "io")
                {
                    expect(inputGateNames).toContain(sc.checkChain.io?.gateName);
                }
            }
        }
    });
}