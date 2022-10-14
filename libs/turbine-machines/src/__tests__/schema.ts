import fs from "fs";
import path from "path";

import * as fileSchema from "../../node_modules/@metalizzsas/nuster-typings/build/schemas/schema-specs.json";

import { matchers } from 'jest-json-schema';

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

            if(files4.map(k => k.name).includes("specs.json"))
            {
                let addonFolder = path.resolve("data", f.name, f2.name, f3.name, "addons");
                let addonsFiles: [string, string][] = [];

                if(fs.existsSync(addonFolder))
                    addonsFiles = fs.readdirSync(addonFolder, { withFileTypes: true}).filter(k => k.name.includes(".json")).map(k => [k.name, path.resolve(addonFolder, k.name)])

                filesToCheck.push({
                    model: f.name,
                    variant: f2.name,
                    revision: f3.name,
                    file: path.resolve("data", f.name, f2.name, f3.name, "specs.json")
                });
            }
        }
    }
}

for(const file of filesToCheck)
{
    const json = JSON.parse(fs.readFileSync(file.file, {encoding: "utf-8"}));

    it('validating ' + file.model + ' ' + file.variant.toUpperCase() + ' R' + file.revision + ' Schema', () => {
        expect(json).toMatchSchema(fileSchema);
    });
}