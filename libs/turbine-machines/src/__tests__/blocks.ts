import fs from "fs";
import path from "path";

import { matchers } from 'jest-json-schema';

import type { MachineSpecs } from "@metalizzsas/nuster-typings/build/spec";
import { AllProgramBlocks } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ProgramBlocks";
import { AllParameterBlocks } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";

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
    const json = JSON.parse(fs.readFileSync(file.file, {encoding: "utf-8"})) as MachineSpecs;

    const gateNames = json.iogates.map(m => m.name);

    const inputGateNames = json.iogates.filter(g => g.bus == "in").map(m => m.name);

    it('validating ' + file.model + ' ' + file.variant.toUpperCase() + ' R' + file.revision + ' Profile fields', () => {

        const fields: {[x: string]: string[]} = {};

        json.profileSkeletons.forEach(p => {
            fields[p.name] = p.fields.flatMap(f => f.name);
        });
    });

    it('validating ' + file.model + ' ' + file.variant.toUpperCase() + ' R' + file.revision + ' Slots sensors', () => {

        for(const slot of json.containers)
        {
            if(slot.sensors)
            {
                for(const sensor of slot.sensors)
                {
                    expect(inputGateNames).toContain(sensor.io);
                }
            }

            if(slot.regulations)
            {
                for(const regulation of slot.regulations)
                {
                    const io = [...regulation.plus, ...regulation.active, regulation.security.map(s => s.name), regulation.sensor, ...regulation.minus];

                    for(const t of io)
                    {
                        expect(gateNames).toContain(t);
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
                    expect(inputGateNames).toContain(ai);
                }
            }
        }
    });
}