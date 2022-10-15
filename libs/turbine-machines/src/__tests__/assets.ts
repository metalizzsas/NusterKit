import type { IMachineSpecs } from "@metalizzsas/nuster-typings/build/spec";
import fs from "fs";
import path from "path";

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

for(let file of filesToCheck)
{
    const json = JSON.parse(fs.readFileSync(file.file, {encoding: "utf-8"})) as IMachineSpecs;

    const cyclePremades = json.cyclePremades.map(c => c.name);
    const cpFiles = cyclePremades.map(cp => path.resolve("data", file.model, file.variant, file.revision, "assets", "cycle", cp + ".png"))

    const maintenancesImages = json.maintenance.flatMap(m => {return {name: m.name, media: m.procedure?.steps.flatMap(s => s.media)}});

    it('validating ' + file.model + ' ' + file.variant.toUpperCase() + ' R' + file.revision + ' Cycle assets', () => {
        
        //Check cycle assets file presence
        for(const cp of cpFiles)
        {
            expect(fs.existsSync(cp)).toBe(true);
        }
    });

    it('validating ' + file.model + ' ' + file.variant.toUpperCase() + ' R' + file.revision + ' Maintenance assets', () => {
        
        for(const obj of maintenancesImages)
        {
            for(const media of obj.media ?? [])
            {
                expect(fs.existsSync(path.resolve("data", file.model, file.variant, file.revision, "assets", "maintenance", obj.name ,media))).toBe(true);
            }
        }
    });
}