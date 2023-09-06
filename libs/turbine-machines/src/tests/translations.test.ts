import fs from "fs";
import path from "path";
import { matchers } from 'jest-json-schema';

import type { MachineSpecs } from "@metalizzsas/nuster-typings/build/spec/";
import { TranslationsSchema as fileSchema } from "@metalizzsas/nuster-typings";
import { Machines } from "..";
import type { PBRRunCondition } from "@metalizzsas/nuster-typings/build/spec/cycle/PBRRunCondition";

expect.extend(matchers);

for(const machine of Object.keys(Machines))
{
    // @ts-ignore
    const machineSpecs: MachineSpecs | undefined = Machines[machine];

    if(machineSpecs === undefined)
        continue;

    const machinePath = path.resolve("node_modules", "@metalizzsas", "nuster-misc", "i18n", "machines", machine);
    const langs = fs.readdirSync(machinePath);

    /// - Properties to be tested

    const ioGates = machineSpecs.iogates.map(g => g.name);
        
    const ioGatesCategories = new Set(machineSpecs.iogates.map(g => g.name.split("#").length > 1 ? g.name.split("#")[0] : "null"));
    ioGatesCategories.delete("null");

    const profileFields = new Set(machineSpecs.profileSkeletons.filter(k => k.name === "default").flatMap(s => s.fields));

    const profileCategories = new Set([...profileFields].map(f => f.name.split("#").length > 1 ? f.name.split("#")[0] : undefined).filter(s => s != undefined)) as Set<string>;
    const profileFieldNames = new Set([...profileFields].map(f => f.name.split("#").length > 1 ? f.name.split("#")[1] : undefined).filter(s => s != undefined)) as Set<string>;

    // Deleting fields that are translated by desktop
    profileFieldNames.delete("enabled");
    profileFieldNames.delete("timeOn");
    profileFieldNames.delete("timeOff");
    profileFieldNames.delete("count");
    profileFieldNames.delete("duration");
    profileFieldNames.delete("speed");

    const containersNames = machineSpecs.containers.flatMap(s => s.name);

    const containersActions: string[][] = machineSpecs.containers.filter(s => s.callToAction !== undefined).flatMap(s => s.callToAction!.map(c => [s.name, c.name]))

    const cyclesNames = machineSpecs.cycleTypes.map(c => c.name);
    const cycleSteps = new Set(machineSpecs.cycleTypes.flatMap(c => c.steps.map(s => s.name)));

    const cyclePremadeProfiles = new Set(machineSpecs.cyclePremades.map(c => c.name));

    const maintenancesNames = machineSpecs.maintenance.map(m => m.name);

    for(const lang of langs)
    {
        const translation = JSON.parse(fs.readFileSync(path.resolve(machinePath, lang), "utf-8"));

        test(`Validating ${machine} ${lang} langfile schema.`, () => {
            expect(translation).toMatchSchema(fileSchema);
        });

        test(`Validating ${machine} ${lang} langfile properties.`, () => {

            //iogates
            //names
            for(const ioGate of ioGates)
            {
                expect(translation).toHaveProperty("gates.names." + ioGate);
            }
            //categories
            for(const cate of ioGatesCategories)
            {
                expect(translation).toHaveProperty("gates.categories." + cate);
            }

            //profiles
            //rows
            for(const row of profileFieldNames)
            {
                expect(translation).toHaveProperty("profile.rows." + row);
            }
            //categories
            for(const category of profileCategories)
            {
                expect(translation).toHaveProperty("profile.categories." + category);
            }

            //slots
            //names
            for(const slot of containersNames)
            {
                expect(translation).toHaveProperty("containers." + slot + ".name");
            }
            //actions
            for(const [slot, action] of containersActions)
            {
                expect(translation).toHaveProperty(`containers.${slot}.actions.${action}`);
            }

            //cycles
            //names
            for(const name of cyclesNames)
            {
                expect(translation).toHaveProperty("cycle.names." + name);
            }
            //steps
            for(const step of cycleSteps)
            {
                expect(translation).toHaveProperty("cycle.steps." + step + ".name")
                expect(translation).toHaveProperty("cycle.steps." + step + ".desc")
            }
            //premades
            for(const premade of cyclePremadeProfiles)
            {
                expect(translation).toHaveProperty("profile.premade." + premade);
            }

            //startConditions
            for(const sc of machineSpecs.cycleTypes.flatMap(c => c.runConditions))
            {
                expect(translation).toHaveProperty("cycle.run_conditions." + sc.name);
        
                if(sc.startOnly != true)
                    expect(translation).toHaveProperty("cycle.end_reasons.security-" + sc.name)
            }

            for(const sr of machineSpecs.cycleTypes.flatMap(c => c.steps.flatMap(s => s.runConditions).filter((s): s is PBRRunCondition => s != undefined)))
            {
                expect(translation).toHaveProperty("cycle.run_conditions." + sr.name);
                expect(translation).toHaveProperty("cycle.end_reasons.security-" + sr.name);
            }

            for(const maintenancesName of maintenancesNames)
            {
                expect(translation).toHaveProperty(`maintenance.tasks.${maintenancesName}.name`);
                expect(translation).toHaveProperty(`maintenance.tasks.${maintenancesName}.desc`);
            }
        });
    }
}