import fs from "fs";
import path from "path";

import type { MachineSpecs } from "@metalizzsas/nuster-typings/build/spec/";

interface Specs {
    model: string;
    variant: string;
    revision: string;
    file: string;
    translations: {[x:string]: string}
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
                const translations: {[x: string]: string} = {};

                for(const f5 of fs.readdirSync(path.resolve("data", f.name, f2.name, f3.name, "assets", "lang"), { withFileTypes: true }).filter(f => f.isFile()))
                {
                    const file = f5.name.split(".");
                    translations[file[0]] = path.resolve("data", f.name, f2.name, f3.name, "assets", "lang", f5.name);
                }

                filesToCheck.push({
                    model: f.name,
                    variant: f2.name,
                    revision: f3.name,
                    file: path.resolve("data", f.name, f2.name, f3.name, "specs.json"),
                    translations
                });
            }
        }
    }
}

for(const file of filesToCheck)
{
    const json = JSON.parse(fs.readFileSync(file.file, {encoding: "utf-8"})) as MachineSpecs;

    const ioGates = json.iogates.map(g => g.name);

    const ioGatesCategories = new Set(json.iogates.map(g => g.name.split("#").length > 1 ? g.name.split("#")[0] : "null"));
    ioGatesCategories.delete("null");

    const profileFields = new Set(json.profileSkeletons.flatMap(s => s.fields));

    const profileCategories = new Set([...profileFields].map(f => f.name.split("#").length > 1 ? f.name.split("#")[0] : undefined).filter(s => s != undefined)) as Set<string>;
    const profileFieldNames = new Set([...profileFields].map(f => f.name.split("#").length > 1 ? f.name.split("#")[1] : undefined).filter(s => s != undefined)) as Set<string>;

    // Deleting fields that are translated by desktop
    profileFieldNames.delete("enabled");
    profileFieldNames.delete("timeOn");
    profileFieldNames.delete("timeOff");
    profileFieldNames.delete("count");
    profileFieldNames.delete("duration");
    profileFieldNames.delete("speed");

    const containersNames = json.containers.flatMap(s => s.name);

    const containersActions: string[][] = json.containers.filter(s => s.callToAction !== undefined).flatMap(s => s.callToAction!.map(c => [s.name, c.name]))

    const cyclesNames = json.cycleTypes.map(c => c.name);
    const cycleSteps = new Set(json.cycleTypes.flatMap(c => c.steps.map(s => s.name)));
    cycleSteps.delete("start");

    const cyclePremadeNames = new Set(json.cyclePremades.map(c => c.name));

    for(const langFile of Object.keys(file.translations))
    {
        const translation = JSON.parse(fs.readFileSync(file.translations[langFile], {encoding: 'utf-8'}));

        it('validating ' + file.model + ' ' + file.variant.toUpperCase() + ' R' + file.revision + ' ' + langFile.toUpperCase() + ' Translations', () => {
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
                expect(translation).toHaveProperty("containers.types." + slot);
            }
            //actions
            for(const [slot, action] of containersActions)
            {
                expect(translation).toHaveProperty("slots.modal.actions." + slot + "." + action);
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
            for(const premade of cyclePremadeNames)
            {
                expect(translation).toHaveProperty("cycle.types." + premade);
            }
            //startConditions
            for(const sc of json.cycleTypes.flatMap(c => c.startConditions))
            {
                
                expect(translation).toHaveProperty("cycle.startconditions." + sc.conditionName);
        
                if(sc.startOnly != true)
                    expect(translation).toHaveProperty("cycle.endreasons.security-" + sc.conditionName)
            }
        });
    }
}