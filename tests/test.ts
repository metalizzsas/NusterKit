import fs from "fs";
import path from "path";

import * as fileSchema from "./schema.json";

import { matchers } from 'jest-json-schema';

expect.extend(matchers);

let files = fs.readdirSync(path.resolve("data"), { withFileTypes: true });
let filesToCheck: string[] = [];

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
                filesToCheck.push(path.resolve("data", f.name, f2.name, f3.name, "specs.json"));
            }
        }
    }
}

for(const file of filesToCheck)
{
    it('validating ' + file, () => {
        expect(JSON.parse(fs.readFileSync(file, {encoding: "utf-8"}))).toMatchSchema(fileSchema);
    });
}